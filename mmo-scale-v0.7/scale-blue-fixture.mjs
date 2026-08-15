import { createHash } from 'node:crypto';
import { buildEnrichedBlueFixture } from './live-blue-fixture.mjs';
import { canonicalJson } from '../src/canonical.mjs';

function digestStep(previousDigest, event) {
  return createHash('sha256').update(previousDigest).update('\n').update(canonicalJson(event)).digest('hex');
}
export function digestEvents(events, initialDigest = 'FOTN_MMO_PERSISTENCE_SEQUENCE_V0_7') {
  return events.reduce((d,e)=>digestStep(d,e), initialDigest);
}

export function buildBlueScaleFixture(tailEventCount, seed = 20260815) {
  if (!Number.isSafeInteger(tailEventCount) || tailEventCount < 1) throw new TypeError('TAIL_EVENT_COUNT_POSITIVE_INTEGER_REQUIRED');
  const base = buildEnrichedBlueFixture(seed);
  const tailEvents = Array.from({length:tailEventCount}, (_, i) => {
    const source = base.events[i % base.events.length];
    return {
      eventId:`scale-${tailEventCount}-${String(i).padStart(6,'0')}`,
      sourceIntentId:`scale-probe-${tailEventCount}-${String(i).padStart(6,'0')}`,
      actorPlayerId:'system.persistence.scale',
      encounterId:base.finalState.encounter.encounterId,
      type:'FOTN_MMO_PERSISTENCE_SCALE_PROBE',
      payload:{
        fixtureClass:'NON_CANON_TECHNICAL_PERSISTENCE_PROBE',
        probeIndex:i,
        tailEventCount,
        sourceBlueEventType:source.type,
        baseBlueFinalHash:base.finalHash
      }
    };
  });
  const allEvents=[...base.events,...tailEvents];
  const snapshotTailCount=Math.floor(tailEventCount/2);
  const snapshotEventCount=base.events.length+snapshotTailCount;
  const snapshotRevision=snapshotEventCount-1;
  const snapshotDigest=digestEvents(allEvents.slice(0,snapshotEventCount));
  const finalDigest=digestEvents(allEvents);
  const rebuiltDigest=digestEvents(allEvents.slice(snapshotEventCount),snapshotDigest);
  if (rebuiltDigest!==finalDigest) throw new Error(`SCALE_DIGEST_SNAPSHOT_TAIL_MISMATCH:${tailEventCount}`);
  return {
    seed,tailEventCount,baseEventCount:base.events.length,totalEventCount:allEvents.length,
    initial:base.initial,baseEvents:base.events,baseBlueFinalState:base.finalState,baseBlueFinalHash:base.finalHash,
    tailEvents,allEvents,snapshotTailCount,snapshotEventCount,snapshotRevision,snapshotDigest,finalDigest
  };
}
