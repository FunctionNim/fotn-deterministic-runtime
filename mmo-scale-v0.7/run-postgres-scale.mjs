import fs from 'node:fs';
import assert from 'node:assert/strict';
import { Pool } from 'pg';
import { buildBlueScaleFixture, digestEvents } from './scale-blue-fixture.mjs';
import { summarizeSamples, timed } from './scale-utils.mjs';
import { makePostgresEventStore } from '../adapters/postgres-live-adapter.mjs';
import { blueMazeRiverAdapter } from '../src/blueMazeRiverSlice.mjs';
import { canonicalJson } from '../src/canonical.mjs';

const TIERS=(process.env.FOTN_SCALE_TIERS ?? '100,1000,5000').split(',').map(Number);
const REPETITIONS=Number(process.env.FOTN_SCALE_REPETITIONS ?? 3);
const CONTENTION=(process.env.FOTN_CONTENTION_TIERS ?? '2,8,32').split(',').map(Number);
const suffix=process.env.GITHUB_RUN_ID ?? `${Date.now()}`;
const pool=new Pool({host:process.env.PGHOST??'127.0.0.1',port:Number(process.env.PGPORT??5432),user:process.env.PGUSER??'postgres',password:process.env.PGPASSWORD??'postgres',database:process.env.PGDATABASE??'postgres',max:40});
const schema=fs.readFileSync(new URL('../adapters/postgres-event-store-v0.3.sql',import.meta.url),'utf8');
await pool.query(schema);
const store=makePostgresEventStore(pool);

async function runTier(tailEventCount, rep) {
  const fixture=buildBlueScaleFixture(tailEventCount);
  const streamId=`scale:blue:pg:${suffix}:${tailEventCount}:r${rep}`;
  const baseAppend=await timed(()=>store.append(streamId,fixture.baseEvents,-1));
  assert.equal(baseAppend.value.nextRevision,11);
  let expected=11; const appendSamples=[];
  const writeTotal=await timed(async()=>{
    for (const event of fixture.tailEvents) {
      const one=await timed(()=>store.append(streamId,[event],expected));
      appendSamples.push(one.ms); expected=one.value.nextRevision;
    }
  });
  assert.equal(expected,fixture.totalEventCount-1);
  const fullRead=await timed(()=>store.readStream(streamId,0));
  const rows=fullRead.value;
  assert.equal(rows.length,fixture.totalEventCount);
  assert.deepEqual(rows.map(x=>canonicalJson(x.event)),fixture.allEvents.map(canonicalJson));
  const baseRead=rows.slice(0,12).map(x=>x.event);
  assert.equal(blueMazeRiverAdapter.hashState(blueMazeRiverAdapter.replay(fixture.initial,baseRead)),fixture.baseBlueFinalHash);
  assert.equal(digestEvents(rows.map(x=>x.event)),fixture.finalDigest);
  const snapshotState={fixtureClass:'NON_CANON_TECHNICAL_PERSISTENCE_SCALE_SNAPSHOT',eventCount:fixture.snapshotEventCount,sequenceDigest:fixture.snapshotDigest,baseBlueFinalHash:fixture.baseBlueFinalHash};
  const snapSave=await timed(()=>store.saveSnapshot(streamId,fixture.snapshotRevision,fixture.snapshotDigest,snapshotState));
  const snapLoad=await timed(()=>store.loadSnapshot(streamId));
  assert.equal(snapLoad.value.revision,fixture.snapshotRevision);
  assert.equal(snapLoad.value.hash,fixture.snapshotDigest);
  const tailRead=await timed(()=>store.readStream(streamId,fixture.snapshotRevision+1));
  const rebuiltDigest=digestEvents(tailRead.value.map(x=>x.event),snapLoad.value.state.sequenceDigest);
  assert.equal(rebuiltDigest,fixture.finalDigest);
  return {repetition:rep,streamId,tailEventCount,totalEventCount:fixture.totalEventCount,baseBlueFinalHash:fixture.baseBlueFinalHash,finalDigest:fixture.finalDigest,snapshotRevision:fixture.snapshotRevision,checks:{orderedRead:true,blueBaseReplay:true,fullSequenceDigest:true,snapshotTailDigest:true},timingMs:{baseAppend:baseAppend.ms,tailWriteTotal:writeTotal.ms,fullRead:fullRead.ms,snapshotSave:snapSave.ms,snapshotLoad:snapLoad.ms,snapshotTailRead:tailRead.ms},throughputEventsPerSecond:tailEventCount/(writeTotal.ms/1000),appendLatencyMs:summarizeSamples(appendSamples)};
}

async function runContention(writers) {
  const fixture=buildBlueScaleFixture(100);
  const streamId=`scale:blue:pg:${suffix}:contention:${writers}`;
  const events=Array.from({length:writers},(_,i)=>({...fixture.tailEvents[i],eventId:`pg-scale-contend-${writers}-${i}`,sourceIntentId:`pg-scale-contend-${writers}-${i}`}));
  const t=await timed(()=>Promise.allSettled(events.map(e=>store.append(streamId,[e],-1))));
  const fulfilled=t.value.filter(x=>x.status==='fulfilled').length;
  const rejected=t.value.filter(x=>x.status==='rejected').length;
  assert.equal(fulfilled,1); assert.equal(rejected,writers-1);
  return {writers,fulfilled,rejected,durationMs:t.ms,check:'PASS_SINGLE_WINNER'};
}

try {
  const version=(await pool.query('select version() as version')).rows[0].version;
  const tiers=[];
  for (const n of TIERS) {
    const repetitions=[];
    for (let r=1;r<=REPETITIONS;r++) repetitions.push(await runTier(n,r));
    tiers.push({tailEventCount:n,repetitions});
  }
  const contention=[]; for (const n of CONTENTION) contention.push(await runContention(n));
  const report={status:'PASS_POSTGRESQL_SCALE_V0_7',database:'PostgreSQL',version,runner:{githubRunId:process.env.GITHUB_RUN_ID??null},configuration:{tiers:TIERS,repetitions:REPETITIONS,contentionTiers:CONTENTION},boundary:'Scale tails are non-canon technical persistence probes following the exact 12-event Blue v0.6 fixture.',tiers,contention};
  fs.writeFileSync(new URL('../reports/postgres-scale-v0.7.json',import.meta.url),JSON.stringify(report,null,2));
  console.log(JSON.stringify(report,null,2));
} finally { await pool.end(); }
