export const SCE_PHASES = ['HOLD', 'RELATE', 'UNDERSTAND', 'BECOME', 'RETURN'] as const;

export type ScePhase = (typeof SCE_PHASES)[number];

export type SceRiverFamily =
  | 'REC'
  | 'REQ'
  | 'FND'
  | 'MAN'
  | 'RES'
  | 'BST'
  | 'SCT'
  | 'AWP'
  | 'QST';

export type SceOutcome = 'COMMIT' | 'DENY' | 'HALT';

export interface InteractionTrace {
  legallyInteracted: boolean;
  changed: boolean;
}

export interface RiverCard {
  cardId: string;
  family: SceRiverFamily;
  timerTurnsRemaining: number | null;
  admittedForTurn: number;
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
  intentType: SceIntent['type'] | 'ExpireRiverCard' | 'AdmitRiverCard' | 'PacketEntryUnused';
  outcome: SceOutcome;
  code?: string;
  cardId?: string;
  slotIndex?: number;
}

export interface SceGameState {
  turn: number;
  maxTurns: 30;
  phase: ScePhase;
  river: RiverSlot[];
  removedFromGame: string[];
  assistanceEligibleCardIds: string[];
  returnResolvedForTurn: number | null;
  audit: AuditEntry[];
}

export type SceIntent =
  | { type: 'AdvancePhase' }
  | { type: 'ResolveReturnRiver' }
  | { type: 'RecordCardInteraction'; slotIndex: number; changed: boolean };

export interface SceTransitionResult {
  state: SceGameState;
  outcome: SceOutcome;
  code?: string;
}

export const SCE_TIMER_REGISTRY: Readonly<Record<SceRiverFamily, number | null>> = {
  REC: 4,
  REQ: 2,
  FND: 3,
  MAN: 3,
  RES: 3,
  BST: 4,
  SCT: 3,
  AWP: null,
  QST: 4,
};

/**
 * Current Living Rulebook timer note:
 * - Pressure Beast natural TIMER-4 expiration creates NO WOUND.
 * - Awaiting Pressure has NO POSITION TIMER.
 * - Other family-specific expiration consequences remain owned by their family law.
 */
export const SCE_NATURAL_EXPIRY_WOUND: Readonly<Record<SceRiverFamily, boolean | null>> = {
  REC: false,
  REQ: false,
  FND: false,
  MAN: false,
  RES: null,
  BST: false,
  SCT: false,
  AWP: null,
  QST: false,
};

export const SCE_RIVER_PACKETS: readonly (readonly [
  SceRiverFamily,
  SceRiverFamily,
  SceRiverFamily,
  SceRiverFamily,
  SceRiverFamily,
  SceRiverFamily,
  SceRiverFamily,
])[] = [
  ['REC','REQ','FND','MAN','REC','REQ','FND'],
  ['REC','REQ','MAN','FND','REC','REQ','MAN'],
  ['REC','RES','REQ','FND','MAN','RES','REC'],
  ['REC','RES','REQ','MAN','FND','RES','REQ'],
  ['REC','RES','BST','REQ','FND','MAN','RES'],
  ['REC','RES','BST','SCT','REQ','FND','MAN'],
  ['REC','RES','BST','AWP','SCT','REQ','FND'],
  ['REC','RES','BST','AWP','SCT','MAN','REQ'],
  ['REC','RES','BST','AWP','SCT','FND','MAN'],
  ['REC','RES','BST','AWP','SCT','MAN','FND'],
  ['REC','RES','BST','AWP','SCT','BST','RES'],
  ['REC','RES','BST','AWP','SCT','AWP','BST'],
  ['REC','RES','BST','AWP','SCT','QST','BST'],
  ['REC','RES','BST','AWP','SCT','QST','AWP'],
  ['REC','RES','BST','AWP','SCT','QST','BST'],
  ['REC','BST','AWP','SCT','QST','BST','AWP'],
  ['REC','BST','AWP','SCT','QST','AWP','BST'],
  ['REC','BST','AWP','SCT','QST','BST','AWP'],
  ['REC','BST','AWP','QST','BST','AWP','REC'],
  ['REC','BST','AWP','QST','BST','AWP','BST'],
  ['REC','BST','AWP','QST','AWP','BST','AWP'],
  ['REC','BST','AWP','QST','BST','AWP','BST'],
  ['REC','BST','AWP','QST','AWP','BST','AWP'],
  ['REC','BST','AWP','QST','BST','AWP','BST'],
  ['REC','BST','AWP','QST','AWP','BST','AWP'],
  ['BST','AWP','BST','AWP','BST','AWP','BST'],
  ['AWP','BST','AWP','BST','AWP','BST','AWP'],
  ['BST','AWP','BST','AWP','AWP','BST','AWP'],
  ['AWP','BST','AWP','BST','AWP','AWP','BST'],
  ['BST','AWP','AWP','BST','AWP','BST','AWP'],
] as const;

export function packetForTurn(turn: number) {
  if (turn < 1 || turn > 30) {
    return null;
  }
  return SCE_RIVER_PACKETS[turn - 1];
}

function createRiverCard(
  family: SceRiverFamily,
  slotIndex: RiverSlot['slotIndex'],
  visibleTurn: number,
): RiverCard {
  return {
    cardId: `${family}:T${String(visibleTurn).padStart(2, '0')}:S${slotIndex}`,
    family,
    timerTurnsRemaining: SCE_TIMER_REGISTRY[family],
    admittedForTurn: visibleTurn,
    interaction: {
      legallyInteracted: false,
      changed: false,
    },
  };
}

function openingRiver(): RiverSlot[] {
  const packet = packetForTurn(1);
  if (!packet) {
    throw new Error('Missing Turn 1 Living River packet');
  }

  return ([1,2,3,4,5,6,7] as const).map((slotIndex) => ({
    slotIndex,
    card: createRiverCard(packet[slotIndex - 1], slotIndex, 1),
  }));
}

export function createInitialSceState(): SceGameState {
  return {
    turn: 1,
    maxTurns: 30,
    phase: 'HOLD',
    river: openingRiver(),
    removedFromGame: [],
    assistanceEligibleCardIds: [],
    returnResolvedForTurn: null,
    audit: [],
  };
}

function nextAudit(
  state: SceGameState,
  intentType: AuditEntry['intentType'],
  outcome: SceOutcome,
  details?: Pick<AuditEntry, 'code' | 'cardId' | 'slotIndex'>,
): AuditEntry {
  return {
    sequence: state.audit.length + 1,
    turn: state.turn,
    phase: state.phase,
    intentType,
    outcome,
    ...(details?.code ? { code: details.code } : {}),
    ...(details?.cardId ? { cardId: details.cardId } : {}),
    ...(details?.slotIndex ? { slotIndex: details.slotIndex } : {}),
  };
}

function appendAudit(
  state: SceGameState,
  entry: Omit<AuditEntry, 'sequence'>,
): SceGameState {
  return {
    ...state,
    audit: [
      ...state.audit,
      {
        ...entry,
        sequence: state.audit.length + 1,
      },
    ],
  };
}

function withAudit(
  state: SceGameState,
  intentType: AuditEntry['intentType'],
  outcome: SceOutcome,
  details?: Pick<AuditEntry, 'code' | 'cardId' | 'slotIndex'>,
): SceGameState {
  return {
    ...state,
    audit: [...state.audit, nextAudit(state, intentType, outcome, details)],
  };
}

function deny(
  state: SceGameState,
  intentType: SceIntent['type'],
  code: string,
): SceTransitionResult {
  return {
    state: withAudit(state, intentType, 'DENY', { code }),
    outcome: 'DENY',
    code,
  };
}

function advancePhase(state: SceGameState): SceTransitionResult {
  if (state.phase === 'RETURN') {
    if (state.returnResolvedForTurn !== state.turn) {
      return deny(state, 'AdvancePhase', 'RETURN_RIVER_NOT_RESOLVED');
    }

    if (state.turn >= state.maxTurns) {
      return deny(state, 'AdvancePhase', 'TURN_LIMIT_REACHED');
    }

    const committed: SceGameState = {
      ...state,
      turn: state.turn + 1,
      phase: 'HOLD',
      returnResolvedForTurn: null,
    };

    return {
      state: withAudit(committed, 'AdvancePhase', 'COMMIT'),
      outcome: 'COMMIT',
    };
  }

  const index = SCE_PHASES.indexOf(state.phase);
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
    state: withAudit(committed, 'RecordCardInteraction', 'COMMIT', {
      cardId: slot.card.cardId,
      slotIndex,
    }),
    outcome: 'COMMIT',
  };
}

function resolveReturnRiver(state: SceGameState): SceTransitionResult {
  if (state.phase !== 'RETURN') {
    return deny(state, 'ResolveReturnRiver', 'RETURN_PHASE_REQUIRED');
  }

  if (state.returnResolvedForTurn === state.turn) {
    return deny(state, 'ResolveReturnRiver', 'RETURN_RIVER_ALREADY_RESOLVED');
  }

  let working: SceGameState = {
    ...state,
    river: state.river.map((slot) => ({
      ...slot,
      card: slot.card ? { ...slot.card, interaction: { ...slot.card.interaction } } : null,
    })),
    removedFromGame: [...state.removedFromGame],
    assistanceEligibleCardIds: [...state.assistanceEligibleCardIds],
    audit: [...state.audit],
  };

  const nextRiver: RiverSlot[] = [];

  for (const slot of working.river) {
    const card = slot.card;

    if (!card || card.timerTurnsRemaining === null) {
      nextRiver.push(slot);
      continue;
    }

    const nextTimer = card.timerTurnsRemaining - 1;

    if (nextTimer > 0) {
      nextRiver.push({
        ...slot,
        card: {
          ...card,
          timerTurnsRemaining: nextTimer,
        },
      });
      continue;
    }

    working.removedFromGame.push(card.cardId);

    if (isAssistanceReportEligible(card)) {
      working.assistanceEligibleCardIds.push(card.cardId);
    }

    working = appendAudit(working, {
      turn: state.turn,
      phase: state.phase,
      intentType: 'ExpireRiverCard',
      outcome: 'COMMIT',
      cardId: card.cardId,
      slotIndex: slot.slotIndex,
      code:
        card.family === 'BST'
          ? 'NATURAL_EXPIRY:NO_WOUND'
          : 'NATURAL_EXPIRY:FAMILY_RULE',
    });

    nextRiver.push({
      ...slot,
      card: null,
    });
  }

  working = {
    ...working,
    river: nextRiver,
  };

  const visibleTurn = state.turn + 1;
  const packet = packetForTurn(visibleTurn);

  if (packet) {
    const refilled: RiverSlot[] = [];

    for (const slot of working.river) {
      const family = packet[slot.slotIndex - 1];

      if (slot.card) {
        working = appendAudit(working, {
          turn: state.turn,
          phase: state.phase,
          intentType: 'PacketEntryUnused',
          outcome: 'COMMIT',
          slotIndex: slot.slotIndex,
          code: `PACKET_T${String(visibleTurn).padStart(2, '0')}:${family}`,
        });
        refilled.push(slot);
        continue;
      }

      const admitted = createRiverCard(family, slot.slotIndex, visibleTurn);
      refilled.push({
        ...slot,
        card: admitted,
      });

      working = appendAudit(working, {
        turn: state.turn,
        phase: state.phase,
        intentType: 'AdmitRiverCard',
        outcome: 'COMMIT',
        cardId: admitted.cardId,
        slotIndex: slot.slotIndex,
        code: `PACKET_T${String(visibleTurn).padStart(2, '0')}:${family}`,
      });
    }

    working = {
      ...working,
      river: refilled,
    };
  }

  working = {
    ...working,
    returnResolvedForTurn: state.turn,
  };

  return {
    state: withAudit(working, 'ResolveReturnRiver', 'COMMIT'),
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

    case 'ResolveReturnRiver':
      return resolveReturnRiver(state);

    case 'RecordCardInteraction':
      return recordCardInteraction(state, intent.slotIndex, intent.changed);
  }
}

export function isAssistanceReportEligible(card: RiverCard): boolean {
  return card.interaction.legallyInteracted && card.interaction.changed;
}
