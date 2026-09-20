export const SCE_PHASES = ['HOLD', 'RELATE', 'UNDERSTAND', 'BECOME', 'RETURN'] as const;

export type ScePhase = (typeof SCE_PHASES)[number];

export type SceSourceGap =
  | 'POSITION_TIMER_TABLE'
  | 'RIVER_DISTRIBUTION_SCHEDULE';

export type SceOutcome = 'COMMIT' | 'DENY' | 'HALT';

export interface InteractionTrace {
  legallyInteracted: boolean;
  changed: boolean;
}

export interface RiverCard {
  cardId: string;
  cardType: string;
  timerTurnsRemaining: number | null;
  interaction: InteractionTrace;
}

export interface RiverSlot {
  slotIndex: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  card: RiverCard | null;
}

export interface AuditEntry {
  sequence: number;
  turn: number;
  phase: ScePhase;
  intentType: SceIntent['type'];
  outcome: SceOutcome;
  code?: string;
}

export interface SceGameState {
  turn: number;
  maxTurns: 30;
  phase: ScePhase;
  river: RiverSlot[];
  sourceGaps: SceSourceGap[];
  audit: AuditEntry[];
}

export type SceIntent =
  | { type: 'AdvancePhase' }
  | { type: 'AttemptRiverDistribution' }
  | { type: 'AttemptPositionTimerResolution'; slotIndex: number }
  | { type: 'RecordCardInteraction'; slotIndex: number; changed: boolean };

export interface SceTransitionResult {
  state: SceGameState;
  outcome: SceOutcome;
  code?: string;
}

function emptyRiver(): RiverSlot[] {
  return ([1, 2, 3, 4, 5, 6, 7] as const).map((slotIndex) => ({
    slotIndex,
    card: null,
  }));
}

export function createInitialSceState(): SceGameState {
  return {
    turn: 1,
    maxTurns: 30,
    phase: 'HOLD',
    river: emptyRiver(),
    sourceGaps: ['POSITION_TIMER_TABLE', 'RIVER_DISTRIBUTION_SCHEDULE'],
    audit: [],
  };
}

function nextAudit(
  state: SceGameState,
  intentType: SceIntent['type'],
  outcome: SceOutcome,
  code?: string,
): AuditEntry {
  return {
    sequence: state.audit.length + 1,
    turn: state.turn,
    phase: state.phase,
    intentType,
    outcome,
    ...(code ? { code } : {}),
  };
}

function withAudit(
  state: SceGameState,
  intentType: SceIntent['type'],
  outcome: SceOutcome,
  code?: string,
): SceGameState {
  return {
    ...state,
    audit: [...state.audit, nextAudit(state, intentType, outcome, code)],
  };
}

function haltForGap(
  state: SceGameState,
  intentType: SceIntent['type'],
  gap: SceSourceGap,
): SceTransitionResult {
  return {
    state: withAudit(state, intentType, 'HALT', `SOURCE_GAP:${gap}`),
    outcome: 'HALT',
    code: `SOURCE_GAP:${gap}`,
  };
}

function deny(
  state: SceGameState,
  intentType: SceIntent['type'],
  code: string,
): SceTransitionResult {
  return {
    state: withAudit(state, intentType, 'DENY', code),
    outcome: 'DENY',
    code,
  };
}

function advancePhase(state: SceGameState): SceTransitionResult {
  const index = SCE_PHASES.indexOf(state.phase);

  if (state.phase === 'RETURN') {
    if (state.turn >= state.maxTurns) {
      return deny(state, 'AdvancePhase', 'TURN_LIMIT_REACHED');
    }

    const committed: SceGameState = {
      ...state,
      turn: state.turn + 1,
      phase: 'HOLD',
    };
    return {
      state: withAudit(committed, 'AdvancePhase', 'COMMIT'),
      outcome: 'COMMIT',
    };
  }

  const committed: SceGameState = {
    ...state,
    phase: SCE_PHASES[index + 1],
  };

  return {
    state: withAudit(committed, 'AdvancePhase', 'COMMIT'),
    outcome: 'COMMIT',
  };
}

function recordCardInteraction(
  state: SceGameState,
  slotIndex: number,
  changed: boolean,
): SceTransitionResult {
  const slot = state.river.find((candidate) => candidate.slotIndex === slotIndex);

  if (!slot) {
    return deny(state, 'RecordCardInteraction', 'INVALID_RIVER_SLOT');
  }

  if (!slot.card) {
    return deny(state, 'RecordCardInteraction', 'EMPTY_RIVER_SLOT');
  }

  const river = state.river.map((candidate) => {
    if (candidate.slotIndex !== slotIndex || !candidate.card) {
      return candidate;
    }

    return {
      ...candidate,
      card: {
        ...candidate.card,
        interaction: {
          legallyInteracted: true,
          changed: candidate.card.interaction.changed || changed,
        },
      },
    };
  });

  const committed: SceGameState = { ...state, river };

  return {
    state: withAudit(committed, 'RecordCardInteraction', 'COMMIT'),
    outcome: 'COMMIT',
  };
}

export function applySceIntent(
  state: SceGameState,
  intent: SceIntent,
): SceTransitionResult {
  switch (intent.type) {
    case 'AdvancePhase':
      return advancePhase(state);

    case 'AttemptRiverDistribution':
      if (state.sourceGaps.includes('RIVER_DISTRIBUTION_SCHEDULE')) {
        return haltForGap(
          state,
          intent.type,
          'RIVER_DISTRIBUTION_SCHEDULE',
        );
      }
      return deny(state, intent.type, 'RIVER_DISTRIBUTION_NOT_IMPLEMENTED');

    case 'AttemptPositionTimerResolution':
      if (state.sourceGaps.includes('POSITION_TIMER_TABLE')) {
        return haltForGap(state, intent.type, 'POSITION_TIMER_TABLE');
      }
      return deny(state, intent.type, 'POSITION_TIMER_NOT_IMPLEMENTED');

    case 'RecordCardInteraction':
      return recordCardInteraction(state, intent.slotIndex, intent.changed);
  }
}

export function isAssistanceReportEligible(card: RiverCard): boolean {
  return card.interaction.legallyInteracted && card.interaction.changed;
}
