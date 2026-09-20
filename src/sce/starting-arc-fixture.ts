import {
  applySceIntent,
  createInitialSceState,
  type SceGameState,
} from './contracts.js';

export interface StartingArcTurnSnapshot {
  completedTurn: number;
  riverFamilies: (string | null)[];
  riverTimers: (number | null)[];
  removedFromGameCount: number;
}

export interface StartingArcQualificationScaffold {
  qualificationStatus: 'RUNTIME_SLICE_PASS';
  fullGameplayQualification: 'PENDING_OTHER_GAME_SYSTEMS';
  completedTurnCount: 6;
  finalState: SceGameState;
  turns: StartingArcTurnSnapshot[];
}

/**
 * Runs the source-qualified structural Living River layer for the default
 * six-turn Starting Arc with no voluntary River interactions.
 *
 * This is intentionally narrower than full gameplay qualification: it executes
 * the five-movement skeleton, current family timers, exact seven-slot packets,
 * slot-indexed refill, environmental expiry, and deterministic replay.
 */
export function runStartingArcQualificationScaffold(): StartingArcQualificationScaffold {
  let state = createInitialSceState();
  const turns: StartingArcTurnSnapshot[] = [];

  for (let completedTurn = 1; completedTurn <= 6; completedTurn += 1) {
    for (const expectedPhase of ['RELATE', 'UNDERSTAND', 'BECOME', 'RETURN'] as const) {
      const advance = applySceIntent(state, { type: 'AdvancePhase' });

      if (advance.outcome !== 'COMMIT') {
        throw new Error(
          `Starting Arc phase advance failed: ${advance.code ?? advance.outcome}`,
        );
      }

      state = advance.state;

      if (state.phase !== expectedPhase) {
        throw new Error(
          `Expected phase ${expectedPhase}, received ${state.phase}`,
        );
      }
    }

    const returnResult = applySceIntent(state, { type: 'ResolveReturnRiver' });

    if (returnResult.outcome !== 'COMMIT') {
      throw new Error(
        `Starting Arc RETURN River resolution failed: ${returnResult.code ?? returnResult.outcome}`,
      );
    }

    state = returnResult.state;

    turns.push({
      completedTurn,
      riverFamilies: state.river.map((slot) => slot.card?.family ?? null),
      riverTimers: state.river.map((slot) => slot.card?.timerTurnsRemaining ?? null),
      removedFromGameCount: state.removedFromGame.length,
    });

    const nextTurn = applySceIntent(state, { type: 'AdvancePhase' });

    if (nextTurn.outcome !== 'COMMIT') {
      throw new Error(
        `Starting Arc turn handoff failed: ${nextTurn.code ?? nextTurn.outcome}`,
      );
    }

    state = nextTurn.state;
  }

  return {
    qualificationStatus: 'RUNTIME_SLICE_PASS',
    fullGameplayQualification: 'PENDING_OTHER_GAME_SYSTEMS',
    completedTurnCount: 6,
    finalState: state,
    turns,
  };
}

export function serializeStartingArcScaffold(
  scaffold: StartingArcQualificationScaffold,
): string {
  return JSON.stringify(scaffold);
}
