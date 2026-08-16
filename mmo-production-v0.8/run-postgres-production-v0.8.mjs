import fs from 'node:fs';
import assert from 'node:assert/strict';
import { Pool } from 'pg';
import { buildBlueScaleFixture, digestEvents } from './scale-blue-fixture.mjs';
import { makePostgresEventStore } from '../adapters/postgres-live-adapter.mjs';
import { blueMazeRiverAdapter } from '../src/blueMazeRiverSlice.mjs';
import { canonicalJson } from '../src/canonical.mjs';

const mode=(process.argv[2]??'verify').toLowerCase();
const tailCount=Number(process.env.FOTN_PROD_TAIL_COUNT??1000);
const streamId=process.env.FOTN_STREAM_ID??`prod:blue:v0.8:${process.env.GITHUB_RUN_ID??'local'}`;
const fixture=buildBlueScaleFixture(tailCount);
const sslroot=process.env.PGSSLROOTCERT;
const ssl=sslroot?{ca:fs.readFileSync(sslroot,'utf8'),rejectUnauthorized:true}:undefined;
const pool=new Pool({host:process.env.PGHOST??'127.0.0.1',port:Number(process.env.PGPORT??5432),user:process.env.PGUSER??'fotn_app',password:process.env.PGPASSWORD??'fotn-app-pass',database:process.env.PGDATABASE??'postgres',ssl,max:12});
const store=makePostgresEventStore(pool);
const outFile=process.env.FOTN_REPORT_FILE;

async function securityChecks(){
  const r=(await pool.query(`select current_user as user, rolsuper, rolcreaterole, rolcreatedb, rolreplication, rolbypassrls from pg_roles where rolname=current_user`)).rows[0];
  assert.equal(r.rolsuper,false); assert.equal(r.rolcreaterole,false); assert.equal(r.rolcreatedb,false); assert.equal(r.rolreplication,false); assert.equal(r.rolbypassrls,false);
  const s=(await pool.query(`select ssl, version, cipher from pg_stat_ssl where pid=pg_backend_pid()`)).rows[0];
  assert.equal(s.ssl,true);
  let denied=false; try{ await pool.query(`create role fotn_should_not_create login`); }catch{ denied=true; }
  assert.equal(denied,true);
  return {role:r,ssl:s,createRoleDenied:true};
}

async function writeFixture(){
  const base=await store.append(streamId,fixture.baseEvents,-1); assert.equal(base.nextRevision,11);
  let expected=11;
  for(const event of fixture.tailEvents){ const a=await store.append(streamId,[event],expected); expected=a.nextRevision; }
  assert.equal(expected,fixture.totalEventCount-1);
  const snap={schemaVersion:1,fixtureClass:'NON_CANON_TECHNICAL_PERSISTENCE_SCALE_SNAPSHOT',eventCount:fixture.snapshotEventCount,sequenceDigest:fixture.snapshotDigest,baseBlueFinalHash:fixture.baseBlueFinalHash};
  await store.saveSnapshot(streamId,fixture.snapshotRevision,fixture.snapshotDigest,snap);
  return verifyFixture();
}

async function verifyFixture(){
  const rows=await store.readStream(streamId,0);
  assert.equal(rows.length,fixture.totalEventCount);
  assert.deepEqual(rows.map(x=>canonicalJson(x.event)),fixture.allEvents.map(canonicalJson));
  const baseRead=rows.slice(0,12).map(x=>x.event);
  assert.equal(blueMazeRiverAdapter.hashState(blueMazeRiverAdapter.replay(fixture.initial,baseRead)),fixture.baseBlueFinalHash);
  assert.equal(digestEvents(rows.map(x=>x.event)),fixture.finalDigest);
  const snap=await store.loadSnapshot(streamId); assert.ok(snap); assert.equal(snap.hash,fixture.snapshotDigest);
  const tail=await store.readStream(streamId,fixture.snapshotRevision+1);
  assert.equal(digestEvents(tail.map(x=>x.event),snap.state.sequenceDigest),fixture.finalDigest);
  return {streamId,eventCount:rows.length,baseBlueFinalHash:fixture.baseBlueFinalHash,finalDigest:fixture.finalDigest,snapshotRevision:snap.revision,snapshotSchemaVersion:snap.state.schemaVersion??null};
}

async function evolve(){
  const before=(await pool.query(`select canonical_event_json, metadata from mmo_event_stream_events where stream_id=$1 and revision=0`,[streamId])).rows[0]; assert.ok(before);
  await pool.query(`update mmo_event_stream_events set metadata = metadata || '{"schemaVersion":2,"compatibility":"backward-compatible"}'::jsonb where stream_id=$1 and revision=0`,[streamId]);
  const after=(await pool.query(`select canonical_event_json, metadata from mmo_event_stream_events where stream_id=$1 and revision=0`,[streamId])).rows[0];
  assert.equal(after.canonical_event_json,before.canonical_event_json); assert.equal(after.metadata.schemaVersion,2);
  const snapBefore=await store.loadSnapshot(streamId); assert.ok(snapBefore);
  await pool.query(`update mmo_event_stream_snapshots set state_data=jsonb_set(state_data,'{schemaVersion}','2'::jsonb,true) where stream_id=$1`,[streamId]);
  const snapAfter=await store.loadSnapshot(streamId); assert.equal(snapAfter.hash,snapBefore.hash); assert.equal(snapAfter.state.schemaVersion,2);
  await pool.query(`delete from mmo_projection_stream_counts`);
  await pool.query(`insert into mmo_projection_stream_counts(stream_id,event_count,last_revision) select stream_id,count(*)::bigint,max(revision) from mmo_event_stream_events group by stream_id`);
  const p=(await pool.query(`select event_count,last_revision from mmo_projection_stream_counts where stream_id=$1`,[streamId])).rows[0];
  assert.equal(Number(p.event_count),fixture.totalEventCount); assert.equal(Number(p.last_revision),fixture.totalEventCount-1);
  const verified=await verifyFixture();
  return {...verified,metadataEvolution:true,snapshotMigrationV2:true,projectionRebuild:true};
}

async function appendProbe(label){
  const probeStream=`prod:probe:${label}:${process.env.GITHUB_RUN_ID??'local'}`;
  const event={eventId:`${label}-event-001`,sourceIntentId:`${label}-intent-001`,actorPlayerId:'system.persistence.production-gate',encounterId:'encounter.blue.maze_river',type:'FOTN_MMO_PERSISTENCE_PRODUCTION_PROBE',payload:{fixtureClass:'NON_CANON_TECHNICAL_PRODUCTION_PROBE',label,baseBlueFinalHash:fixture.baseBlueFinalHash,mainStreamId:streamId}};
  const a=await store.append(probeStream,[event],-1); assert.equal(a.nextRevision,0);
  const r=await store.readStream(probeStream,0); assert.equal(r.length,1); assert.equal(r[0].event.eventId,event.eventId);
  return {probeStream,eventId:event.eventId};
}

try{
  const security=await securityChecks();
  let result;
  if(mode==='write') result=await writeFixture();
  else if(mode==='evolve') result=await evolve();
  else if(mode==='probe') result=await appendProbe(process.env.FOTN_PROBE_LABEL??'probe');
  else result=await verifyFixture();
  const report={status:`PASS_POSTGRESQL_PRODUCTION_V0_8_${mode.toUpperCase()}`,mode,server:{host:process.env.PGHOST??'127.0.0.1',port:Number(process.env.PGPORT??5432)},security,result};
  if(outFile) fs.writeFileSync(outFile,JSON.stringify(report,null,2));
  console.log(JSON.stringify(report,null,2));
} finally { await pool.end(); }
