import { describe, expect, it } from 'vitest';
import {
  applyStoneRoomAction,
  createAnchorPulseSpellSeed,
  createRoomThatWouldNotFall,
  createStoneToClayTrialGate,
} from '../src/runtime/index.js';

function solveStoneRoom() {
  let room = createRoomThatWouldNotFall();
  room = applyStoneRoomAction(room, { type: 'EnterRoom' });

  for (const plateId of ['plate:first', 'plate:second', 'plate:threshold']) {
    room = applyStoneRoomAction(room, { type: 'TestAnchor', plateId });
    room = applyStoneRoomAction(room, {
      type: 'NameProtection',
      plateId,
      protectionName: `protect ${plateId}`,
    });
    room = applyStoneRoomAction(room, {
      type: 'NameReleaseCondition',
      plateId,
      releaseCondition: `release ${plateId} when passage is stable`,
    });
    room = applyStoneRoomAction(room, { type: 'CastAnchorPulse', plateId });
    room = applyStoneRoomAction(room, { type: 'ReleaseAnchor', plateId });
  }

  return room;
}

describe('playable pressure engine vertical slice', () => {
  it('creates the Anchor Pulse spell seed with Stone alignment and release containment', () => {
    const spellSeed = createAnchorPulseSpellSeed();

    expect(spellSeed.name).toBe('Anchor Pulse');
    expect(spellSeed.functionType).toBe('Stone');
    expect(spellSeed.containmentRule).toContain('release condition');
    expect(spellSeed.returnOutput).toContain('Living Stability');
  });

  it('creates the Stone to Clay trial gate', () => {
    const trialGate = createStoneToClayTrialGate();

    expect(trialGate.fromFunction).toBe('Stone');
    expect(trialGate.toFunction).toBe('Clay');
    expect(trialGate.reversionWarning).toBe('Burial');
  });

  it('resolves The Room That Would Not Fall when every anchor is protected, released, and recorded', () => {
    const room = solveStoneRoom();

    expect(room.phase).toBe('Resolved');
    expect(room.returnOutput).toContain('Living Stability');
    expect(room.anchorPlates.every((plate) => plate.released)).toBe(true);
  });

  it('records a continuity ledger entry after the Stone room is resolved', () => {
    const resolvedRoom = solveStoneRoom();
    const ledgerRoom = applyStoneRoomAction(resolvedRoom, { type: 'RecordLedger' });

    expect(ledgerRoom.ledgerEntry?.functionTested).toBe('Stone');
    expect(ledgerRoom.ledgerEntry?.spellSeedId).toBe('spell-seed:stone:anchor-pulse');
    expect(ledgerRoom.ledgerEntry?.reversionWarning).toBe('Burial');
    expect(ledgerRoom.ledgerEntry?.returnOutput).toContain('Living Stability');
  });

  it('fails safely when Anchor Pulse is cast before a release condition is named', () => {
    let room = createRoomThatWouldNotFall();
    room = applyStoneRoomAction(room, { type: 'EnterRoom' });
    room = applyStoneRoomAction(room, { type: 'TestAnchor', plateId: 'plate:first' });
    room = applyStoneRoomAction(room, {
      type: 'NameProtection',
      plateId: 'plate:first',
      protectionName: 'protect the passage',
    });
    room = applyStoneRoomAction(room, { type: 'CastAnchorPulse', plateId: 'plate:first' });

    expect(room.phase).toBe('Failed');
    expect(room.failureState).toBe('NoReleaseCondition');
    expect(room.pressureMeter.seal).toBe(1);
    expect(room.pressureMeter.passage).toBe(0);
  });
});
