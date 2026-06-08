/**
 * R12 — Replay Verification Domain tests.
 *
 * Proves:
 *   1. Same scenario replayed twice → identical final state
 *   2. Same scenario replayed twice → identical audit trail
 *   3. Same scenario replayed twice → identical deterministic signature
 *   4. Action order is preserved in every replay
 *   5. Changing an input action intentionally changes the signature
 */

import { describe, it, expect } from 'vitest';
import {
  actIStoneRoomScenario,
  actIForcedFailureScenario,
  actIIFirstContinuationLoopScenario,
  actIInitialStateDescription,
  actIIInitialStateDescription,
  SCENARIO_ACT_I_STONE_ROOM,
  SCENARIO_ACT_I_FORCED_FAILURE,
  SCENARIO_ACT_II_FIRST_LOOP,
} from '../../src/replay/scenarios.js';
import { stableJsonHash } from '../../src/replay/replay-verifier.js';

// ─── Act I — Stone Room: determinism proofs ───────────────────────────────────

describe('R12 Act I — Stone Room replay', () => {

  it('two independent replays produce identical final state', () => {
    const runA = actIStoneRoomScenario();
    const runB = actIStoneRoomScenario();
    expect(runA.finalState).toEqual(runB.finalState);
  });

  it('two independent replays produce identical audit trail', () => {
    const runA = actIStoneRoomScenario();
    const runB = actIStoneRoomScenario();
    expect(runA.auditTrail).toEqual(runB.auditTrail);
  });

  it('two independent replays produce identical signature', () => {
    const runA = actIStoneRoomScenario();
    const runB = actIStoneRoomScenario();
    expect(runA.signature).toEqual(runB.signature);
  });

  it('action order is preserved — orderedActions[i].index === i', () => {
    const result = actIStoneRoomScenario();
    for (const action of result.orderedActions) {
      expect(action.index).toBe(result.orderedActions.indexOf(action));
    }
  });

  it('scenario id is correct', () => {
    const result = actIStoneRoomScenario();
    expect(result.signature.scenarioId).toBe(SCENARIO_ACT_I_STONE_ROOM);
  });

  it('action count matches the number of ordered actions', () => {
    const result = actIStoneRoomScenario();
    expect(result.signature.actionCount).toBe(result.orderedActions.length);
    expect(result.signature.actionCount).toBe(17); // EnterRoom + 5×3 plates + RecordLedger
  });

  it('finalStateHash and auditTrailHash are distinct strings', () => {
    const result = actIStoneRoomScenario();
    expect(result.signature.finalStateHash).not.toBe(result.signature.auditTrailHash);
  });

  it('final state reflects a resolved room with all plates released', () => {
    const result = actIStoneRoomScenario();
    expect(result.finalState.phase).toBe('Resolved');
    expect(result.finalState.allPlatesReleased).toBe(true);
    expect(result.finalState.allPlatesStabilized).toBe(true);
    expect(result.finalState.allPlatesDiscovered).toBe(true);
    expect(result.finalState.ledgerEntryId).toBe('ledger:room:stone:that-would-not-fall');
  });

  it('audit trail is non-empty and ordered (no duplicates from re-ordering)', () => {
    const result = actIStoneRoomScenario();
    expect(result.auditTrail.length).toBeGreaterThan(0);
    // The implementation sorts witnessRecords — same sort on both runs
    const sorted = [...result.auditTrail].sort();
    expect(result.auditTrail).toEqual(sorted);
  });

  it('initial state description is deterministic across two calls', () => {
    const a = actIInitialStateDescription();
    const b = actIInitialStateDescription();
    expect(a).toEqual(b);
    expect(a.phase).toBe('Dormant');
    expect(a.plateCount).toBe(3);
  });

});

// ─── Act II — First Continuation Loop: determinism proofs ─────────────────────

describe('R12 Act II — First Continuation Loop replay', () => {

  it('two independent replays produce identical final state', () => {
    const runA = actIIFirstContinuationLoopScenario();
    const runB = actIIFirstContinuationLoopScenario();
    expect(runA.finalState).toEqual(runB.finalState);
  });

  it('two independent replays produce identical audit trail', () => {
    const runA = actIIFirstContinuationLoopScenario();
    const runB = actIIFirstContinuationLoopScenario();
    expect(runA.auditTrail).toEqual(runB.auditTrail);
  });

  it('two independent replays produce identical signature', () => {
    const runA = actIIFirstContinuationLoopScenario();
    const runB = actIIFirstContinuationLoopScenario();
    expect(runA.signature).toEqual(runB.signature);
  });

  it('action order is preserved — orderedActions[i].index === i', () => {
    const result = actIIFirstContinuationLoopScenario();
    for (const action of result.orderedActions) {
      expect(action.index).toBe(result.orderedActions.indexOf(action));
    }
  });

  it('scenario id is correct', () => {
    const result = actIIFirstContinuationLoopScenario();
    expect(result.signature.scenarioId).toBe(SCENARIO_ACT_II_FIRST_LOOP);
  });

  it('action count matches the number of ordered actions', () => {
    const result = actIIFirstContinuationLoopScenario();
    expect(result.signature.actionCount).toBe(result.orderedActions.length);
    expect(result.signature.actionCount).toBe(7);
  });

  it('final state reflects a resolved encounter', () => {
    const result = actIIFirstContinuationLoopScenario();
    expect(result.finalState.encounterResolved).toBe(true);
    expect(result.finalState.encounterPhase).toBe('Resolved');
  });

  it('initial state description is deterministic across two calls', () => {
    const a = actIIInitialStateDescription();
    const b = actIIInitialStateDescription();
    expect(a).toEqual(b);
    expect(a.encounterResolved).toBe(false);
  });

});

// ─── Mutation probe: changing an action changes the signature ──────────────────

describe('R12 mutation probe — altered action sequence', () => {

  it('forced failure scenario produces a different final state than correct sequence', () => {
    const correct = actIStoneRoomScenario();
    const broken = actIForcedFailureScenario();
    expect(broken.finalState).not.toEqual(correct.finalState);
    expect(broken.finalState.phase).toBe('Failed');
    expect(correct.finalState.phase).toBe('Resolved');
  });

  it('forced failure scenario produces a different signature than correct sequence', () => {
    const correct = actIStoneRoomScenario();
    const broken = actIForcedFailureScenario();
    expect(broken.signature.combinedHash).not.toBe(correct.signature.combinedHash);
    expect(broken.signature.finalStateHash).not.toBe(correct.signature.finalStateHash);
  });

  it('forced failure scenario id is distinct from the correct scenario id', () => {
    const broken = actIForcedFailureScenario();
    expect(broken.signature.scenarioId).toBe(SCENARIO_ACT_I_FORCED_FAILURE);
    expect(broken.signature.scenarioId).not.toBe(SCENARIO_ACT_I_STONE_ROOM);
  });

  it('forced failure action count differs from correct sequence action count', () => {
    const correct = actIStoneRoomScenario();
    const broken = actIForcedFailureScenario();
    expect(broken.signature.actionCount).toBeLessThan(correct.signature.actionCount);
  });

});

// ─── stableJsonHash utility ───────────────────────────────────────────────────

describe('R12 stableJsonHash utility', () => {

  it('identical objects produce identical hashes regardless of key order', () => {
    const a = stableJsonHash({ z: 1, a: 2, m: 3 });
    const b = stableJsonHash({ a: 2, m: 3, z: 1 });
    expect(a).toBe(b);
  });

  it('different values produce different hashes', () => {
    const a = stableJsonHash({ phase: 'Resolved' });
    const b = stableJsonHash({ phase: 'Failed' });
    expect(a).not.toBe(b);
  });

  it('hash is a non-empty string', () => {
    const h = stableJsonHash({ x: 42 });
    expect(typeof h).toBe('string');
    expect(h.length).toBeGreaterThan(0);
  });

});
