import { describe, expect, it } from 'vitest';
import {
  SCE_NATURAL_EXPIRY_WOUND,
  SCE_RIVER_PACKETS,
  SCE_TIMER_REGISTRY,
  applySceIntent,
  createInitialSceState,
  isAssistanceReportEligible,
  packetForTurn,
  type RiverCard,
} from '../../src/sce/contracts.js';
import {
  runStartingArcQualificationScaffold,
  serializeStartingArcScaffold,
} from '../../src/sce/starting-arc-fixture.js';

function advanceToReturn(state = createInitialSceState()) {
  let current = state;
  for (let i = 0; i < 4; i += 1) {
    const result = applySceIntent(current, { type: 'AdvancePhase' });
    expect(result.outcome).toBe('COMMIT');
    current = result.state;
  }
  expect(current.phase).toBe('RETURN');
  return current;
}

describe('Seven Civic Engineers current Living River contracts', () => {
  it('uses the current nine-family timer registry from the Living River Timers tab', () => {
    expect(SCE_TIMER_REGISTRY).toEqual({
      REC: 4,
      REQ: 2,
      FND: 3,
      MAN: 3,
      RES: 3,
      BST: 4,
      SCT: 3,
      AWP: null,
      QST: 4,
    });

    expect(SCE_NATURAL_EXPIRY_WOUND.BST).toBe(false);
    expect(SCE_NATURAL_EXPIRY_WOUND.AWP).toBe(null);
  });

  it('contains exactly thirty authored seven-slot packets', () => {
    expect(SCE_RIVER_PACKETS).toHaveLength(30);
    expect(SCE_RIVER_PACKETS.every((packet) => packet.length === 7)).toBe(true);
    expect(packetForTurn(1)).toEqual([
      'REC','REQ','FND','MAN','REC','REQ','FND',
    ]);
    expect(packetForTurn(30)).toEqual([
      'BST','AWP','AWP','BST','AWP','BST','AWP',
    ]);
  });

  it('opens Turn 1 with the authored T01 seven-slot packet', () => {
    const state = createInitialSceState();

    expect(state.river.map((slot) => slot.card?.family)).toEqual([
      'REC','REQ','FND','MAN','REC','REQ','FND',
    ]);
    expect(state.river.map((slot) => slot.card?.timerTurnsRemaining)).toEqual([
      4,2,3,3,4,2,3,
    ]);
  });

  it('requires RETURN River resolution before advancing to the next turn', () => {
    const state = advanceToReturn();

    const denied = applySceIntent(state, { type: 'AdvancePhase' });
    expect(denied.outcome).toBe('DENY');
    expect(denied.code).toBe('RETURN_RIVER_NOT_RESOLVED');

    const resolved = applySceIntent(state, { type: 'ResolveReturnRiver' });
    expect(resolved.outcome).toBe('COMMIT');

    const advanced = applySceIntent(resolved.state, { type: 'AdvancePhase' });
    expect(advanced.outcome).toBe('COMMIT');
    expect(advanced.state.turn).toBe(2);
    expect(advanced.state.phase).toBe('HOLD');
  });

  it('uses the next-turn packet slot-by-slot after timer expiration', () => {
    let state = advanceToReturn();

    let result = applySceIntent(state, { type: 'ResolveReturnRiver' });
    expect(result.outcome).toBe('COMMIT');
    result = applySceIntent(result.state, { type: 'AdvancePhase' });
    expect(result.outcome).toBe('COMMIT');

    state = advanceToReturn(result.state);
    result = applySceIntent(state, { type: 'ResolveReturnRiver' });

    expect(result.outcome).toBe('COMMIT');

    // Both Turn-1 Requests expire on RETURN of Turn 2.
    // The Turn-3 packet's entries for those exact slots are both RES.
    expect(result.state.river[1].card?.family).toBe('RES');
    expect(result.state.river[5].card?.family).toBe('RES');
    expect(result.state.river[1].card?.timerTurnsRemaining).toBe(3);
    expect(result.state.river[5].card?.timerTurnsRemaining).toBe(3);
  });

  it('makes Assistance-report eligibility depend on legal interaction plus actual change', () => {
    const untouched: RiverCard = {
      cardId: 'card:example',
      family: 'REC',
      timerTurnsRemaining: 4,
      admittedForTurn: 1,
      interaction: { legallyInteracted: false, changed: false },
    };

    const observedOnly: RiverCard = {
      ...untouched,
      interaction: { legallyInteracted: true, changed: false },
    };

    const changed: RiverCard = {
      ...untouched,
      interaction: { legallyInteracted: true, changed: true },
    };

    expect(isAssistanceReportEligible(untouched)).toBe(false);
    expect(isAssistanceReportEligible(observedOnly)).toBe(false);
    expect(isAssistanceReportEligible(changed)).toBe(true);
  });

  it('executes the same six-turn Starting Arc runtime slice identically', () => {
    const first = runStartingArcQualificationScaffold();
    const second = runStartingArcQualificationScaffold();

    expect(first.completedTurnCount).toBe(6);
    expect(first.finalState.turn).toBe(7);
    expect(first.finalState.phase).toBe('HOLD');
    expect(first.qualificationStatus).toBe('RUNTIME_SLICE_PASS');
    expect(first.fullGameplayQualification).toBe('PENDING_OTHER_GAME_SYSTEMS');
    expect(first.turns).toHaveLength(6);

    expect(serializeStartingArcScaffold(first)).toBe(
      serializeStartingArcScaffold(second),
    );
  });
});
