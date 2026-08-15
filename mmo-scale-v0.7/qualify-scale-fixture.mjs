import assert from 'node:assert/strict';
import { buildBlueScaleFixture, digestEvents } from './scale-blue-fixture.mjs';

const tiers=[100,1000,5000]; const reports=[];
for (const n of tiers) {
  const a=buildBlueScaleFixture(n); const b=buildBlueScaleFixture(n);
  assert.equal(a.tailEvents.length,n); assert.equal(a.totalEventCount,n+12);
  assert.equal(a.finalDigest,b.finalDigest);
  assert.equal(a.baseBlueFinalHash,b.baseBlueFinalHash);
  assert.equal(digestEvents(a.allEvents.slice(a.snapshotEventCount),a.snapshotDigest),a.finalDigest);
  assert.ok(a.tailEvents.every(e=>e.type==='FOTN_MMO_PERSISTENCE_SCALE_PROBE' && e.payload.fixtureClass==='NON_CANON_TECHNICAL_PERSISTENCE_PROBE'));
  reports.push({tailEventCount:n,totalEventCount:a.totalEventCount,baseBlueFinalHash:a.baseBlueFinalHash,finalDigest:a.finalDigest,snapshotRevision:a.snapshotRevision});
}
console.log(JSON.stringify({status:'PASS_BLUE_V0_7_PERSISTENCE_SCALE_FIXTURE_QUALIFICATION',boundary:'The first 12 events are the exact Blue v0.6 fixture. Scale tails are non-canon technical persistence probes and are not replayed through the gameplay reducer.',tiers:reports},null,2));
