import {
  applySceIntent,
  createInitialSceState,
  type SceGameState,
  type SceTransitionResult,
} from './contracts.js';

export interface StartingArcQualificationScaffold {
  qualificationStatus: 'HELD_SOURCE_GAPS';
  completedTurnCount: 6;
  finalState: SceGameState;
  sourceGapChecks: {
    riverDistribution: SceTransitionResult;
    positionTimer: SceTransitionResult;
  };
}

/**
 * Executes only the source-qualified structural portion of the Starting Arc.
 *
 * It proves the five-movement turn skeleton can advance deterministically
 * for six complete turns. It deliberately does not invent River distribution
 * or timer values. Those checks must HALT while their governing sources remain
 * unrecovered.
 */
export function runStartingArcQualificationScaffold(): StartingArcQualificationScaffold {
  const initial = createInitialSceState();

  const riverDistribution = applySceIntent(initial, {
    type: 'AttemptRiverDistribution',
  });

  const positionTimer = applySceIntent(initial, {
    type: 'AttemptPositionTimerResolution',
    slotIndex: 1,
  });

  let state = initial;

  for (let completedTurn = 0; completedTurn < 6; completedTurn += 1) {
    for (let phaseAdvance = 0; phaseAdvance < 5; phaseAdvance += 1) {
      const result = applySceIntent(state, { type: 'AdvancePhase' });

      if (result.outcome !== 'COMMIT') {
        throw new Error(
          `Starting Arc structural scaffold stopped unexpectedly: ${result.code ?? result.outcome}`,
        );
      }

      state = result.state;
    }
  }

  return {
    qualificationStatus: 'HELD_SOURCE_GAPS',
    completedTurnCount: 6,
    finalState: state,
    sourceGapChecks: {
      riverDistribution,
      positionTimer,
    },
  };
}

export function serializeStartingArcScaffold(
  scaffold: StartingArcQualificationScaffold,
): string {
  return JSON.stringify(scaffold);
}
