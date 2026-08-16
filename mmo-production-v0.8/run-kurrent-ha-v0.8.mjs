import fs from 'node:fs';
import assert from 'node:assert/strict';
import { KurrentDBClient, jsonEvent, NO_STREAM, FORWARDS, START } from '@kurrent/kurrentdb-client';
import { buildBlueScaleFixture, digestEvents } from './scale-blue-fixture.mjs';
import { makeKurrentEventStore } from '../adapters/kurrent-live-adapter.mjs';
import { blueMazeRiverAdapter } from '../src/blueMazeRiverSlice.mjs';
import { canonicalJson } from '../src/canonical.mjs';

const mode=(process.argv[2]??'verify').toLowerCase();
const tailCount=Number(process.env.FOTN_PROD_TAIL_COUNT??1000);
const streamId=process.env.FOTN_STREAM_ID??`prod-blue-kurrent-v0.8-${process.env.GITHUB_RUN_ID??'local'}`;
const fixture=buildBlueScaleFixture(tailCount);
const connection=process.env.KURRENTDB_CONNECTION_STRING;
if(!connection) throw new Error('KURRENTDB_CONNECTION_STRING_REQUIRED');
const client=KurrentDBClient.connectionString(connection);
const store=makeKurrentEventStore({client,jsonEvent,NO_STREAM,FORWARDS,START});
const outFile=process.env.FOTN_REPORT_FILE;

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
  return {streamId,eventCount:rows.length,baseBlueFinalHash:fixture.baseBlueFinalHash,finalDigest:fixture.finalDigest,snapshotRevision:Number(snap.revision)};
}

async function appendProbe(label){
  const probeStream=`prod-kurrent-probe-${label}-${process.env.GITHUB_RUN_ID??'local'}`;
  const event={eventId:`${label}-event-001`,sourceIntentId:`${label}-intent-001`,actorPlayerId:'system.persistence.production-gate',encounterId:'encounter.blue.maze_river',type:'FOTN_MMO_PERSISTENCE_PRODUCTION_PROBE',payload:{fixtureClass:'NON_CANON_TECHNICAL_PRODUCTION_PROBE',label,baseBlueFinalHash:fixture.baseBlueFinalHash,mainStreamId:streamId}};
  const a=await store.append(probeStream,[event],-1); assert.equal(a.nextRevision,0);
  const r=await store.readStream(probeStream,0); assert.equal(r.length,1); assert.equal(r[0].event.eventId,event.eventId);
  return {probeStream,eventId:event.eventId};
}

try{
  let result;
  if(mode==='write') result=await writeFixture();
  else if(mode==='probe') result=await appendProbe(process.env.FOTN_PROBE_LABEL??'probe');
  else result=await verifyFixture();
  const report={status:`PASS_KURRENTDB_HA_V0_8_${mode.toUpperCase()}`,mode,result};
  if(outFile) fs.writeFileSync(outFile,JSON.stringify(report,null,2));
  console.log(JSON.stringify(report,null,2));
} finally { await client.dispose(); }
