import { describe, expect, it } from 'vitest';
import {
  applySceIntent,
  createInitialSceState,
  isAssistanceReportEligible,
  type RiverCard,
} from '../../src/sce/contracts.js';
import {
  runStartingArcQualificationScaffold,
  serializeStartingArcScaffold,
} from '../../src/sce/starting-arc-fixture.js';

describe('Seven Civic Engineers source-bound runtime contracts', () => {
  it('creates a seven-slot River without inventing card order', () => {
    const state = createInitialSceState();

    expect(state.river).toHaveLength(7);
    expect(state.river.map((slot) => slot.slotIndex)).toEqual([
      1, 2, 3, 4, 5, 6, 7,
    ]);
    expect(state.river.every((slot) => slot.card === null)).toBe(true);
  });

  it('advances through HOLD → RELATE → UNDERSTAND → BECOME → RETURN deterministically', () => {
    let state = createInitialSceState();

    for (const expected of ['RELATE', 'UNDERSTAND', 'BECOME', 'RETURN']) {
      const result = applySceIntent(state, { type: 'AdvancePhase' });
      expect(result.outcome).toBe('COMMIT');
      state = result.state;
      expect(state.phase).toBe(expected);
    }

    const nextTurn = applySceIntent(state, { type: 'AdvancePhase' });
    expect(nextTurn.outcome).toBe('COMMIT');
    expect(nextTurn.state.turn).toBe(2);
    expect(nextTurn.state.phase).toBe('HOLD');
  });

  it('HALTs River distribution while the governing schedule is a source recovery gap', () => {
    const state = createInitialSceState();
    const before = JSON.stringify({
      turn: state.turn,
      phase: state.phase,
      river: state.river,
    });

    const result = applySceIntent(state, {
      type: 'AttemptRiverDistribution',
    });

    expect(result.outcome).toBe('HALT');
    expect(result.code).toBe('SOURCE_GAP:RIVER_DISTRIBUTION_SCHEDULE');
    expect(
      JSON.stringify({
        turn: result.state.turn,
        phase: result.state.phase,
        river: result.state.river,
      }),
    ).toBe(before);
  });

  it('HALTs timer resolution while the nine-card timer table is a source recovery gap', () => {
    const state = createInitialSceState();
    const result = applySceIntent(state, {
      type: 'AttemptPositionTimerResolution',
      slotIndex: 1,
    });

    expect(result.outcome).toBe('HALT');
    expect(result.code).toBe('SOURCE_GAP:POSITION_TIMER_TABLE');
  });

  it('makes Assistance-report eligibility depend on legal interaction plus actual change', () => {
    const untouched: RiverCard = {
      cardId: 'card:example',
      cardType: 'EXAMPLE',
      timerTurnsRemaining: null,
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

  it('executes the same six-turn structural qualification scaffold identically', () => {
    const first = runStartingArcQualificationScaffold();
    const second = runStartingArcQualificationScaffold();

    expect(first.completedTurnCount).toBe(6);
    expect(first.finalState.turn).toBe(7);
    expect(first.finalState.phase).toBe('HOLD');
    expect(first.finalState.audit).toHaveLength(30);
    expect(first.qualificationStatus).toBe('HELD_SOURCE_GAPS');

    expect(first.sourceGapChecks.riverDistribution.outcome).toBe('HALT');
    expect(first.sourceGapChecks.positionTimer.outcome).toBe('HALT');
    expect(serializeStartingArcScaffold(first)).toBe(
      serializeStartingArcScaffold(second),
    );
  });
});
