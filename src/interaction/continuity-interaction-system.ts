import type { EncounterState, SeekerState } from '../runtime/continuity-state.js';
import { EncounterPhase } from '../runtime/resonance-types.js';

export enum ContinuityInteractionState {
  Observe = 'Observe',
  Approach = 'Approach',
  Commit = 'Commit',
  PressureResponse = 'PressureResponse',
  InterruptionCheck = 'InterruptionCheck',
  Resolution = 'Resolution',
  ExhaustionRecovery = 'ExhaustionRecovery',
  MemoryRecording = 'MemoryRecording',
  WorldContinues = 'WorldContinues',
}

export enum ContinuityInteractionIntent {
  Observe = 'Observe',
  Stabilize = 'Stabilize',
  Gather = 'Gather',
  Restore = 'Restore',
  Debate = 'Debate',
  Craft = 'Craft',
  Meditate = 'Meditate',
  Depart = 'Depart',
}

export interface ContinuityInteractionInput {
  readonly seeker: SeekerState;
  readonly encounter?: EncounterState;
  readonly currentState: ContinuityInteractionState;
  readonly intent: ContinuityInteractionIntent;
  readonly withinInteractionRange: boolean;
  readonly pressureChange: number;
  readonly bondAssistStrength: number;
}

export interface ContinuityInteractionResult {
  readonly nextState: ContinuityInteractionState;
  readonly encounterPhase: EncounterPhase;
  readonly exhaustionDelta: number;
  readonly pressureDelta: number;
  readonly mentalismClarityDelta: number;
  readonly memoryShouldRecord: boolean;
  readonly worldShouldContinue: boolean;
}

export class ContinuityInteractionSystem {
  public execute(input: ContinuityInteractionInput): ContinuityInteractionResult {
    const pressureDelta = clamp01(input.pressureChange - input.bondAssistStrength * 0.25);
    const exhaustionDelta = resolveExhaustionDelta(input, pressureDelta);
    const nextState = resolveNextState(input, pressureDelta, exhaustionDelta);

    return {
      nextState,
      encounterPhase: encounterPhaseFor(nextState),
      exhaustionDelta,
      pressureDelta,
      mentalismClarityDelta: -exhaustionDelta * 0.5,
      memoryShouldRecord: nextState === ContinuityInteractionState.MemoryRecording,
      worldShouldContinue: nextState === ContinuityInteractionState.WorldContinues,
    };
  }
}

function resolveNextState(
  input: ContinuityInteractionInput,
  pressureDelta: number,
  exhaustionDelta: number,
): ContinuityInteractionState {
  if (input.intent === ContinuityInteractionIntent.Depart) {
    return ContinuityInteractionState.WorldContinues;
  }

  if (input.intent === ContinuityInteractionIntent.Meditate) {
    return ContinuityInteractionState.ExhaustionRecovery;
  }

  if (!input.withinInteractionRange) {
    return ContinuityInteractionState.Approach;
  }

  if (input.seeker.exhaustionLevel + exhaustionDelta >= 1) {
    return ContinuityInteractionState.ExhaustionRecovery;
  }

  switch (input.currentState) {
    case ContinuityInteractionState.Observe:
      return input.intent === ContinuityInteractionIntent.Observe
        ? ContinuityInteractionState.Observe
        : ContinuityInteractionState.Approach;
    case ContinuityInteractionState.Approach:
      return ContinuityInteractionState.Commit;
    case ContinuityInteractionState.Commit:
      return pressureDelta > 0.45
        ? ContinuityInteractionState.PressureResponse
        : ContinuityInteractionState.Resolution;
    case ContinuityInteractionState.PressureResponse:
      return ContinuityInteractionState.InterruptionCheck;
    case ContinuityInteractionState.InterruptionCheck:
      return pressureDelta > 0.65
        ? ContinuityInteractionState.ExhaustionRecovery
        : ContinuityInteractionState.Resolution;
    case ContinuityInteractionState.Resolution:
      return ContinuityInteractionState.MemoryRecording;
    case ContinuityInteractionState.MemoryRecording:
      return ContinuityInteractionState.WorldContinues;
    case ContinuityInteractionState.ExhaustionRecovery:
      return ContinuityInteractionState.Observe;
    case ContinuityInteractionState.WorldContinues:
      return ContinuityInteractionState.Observe;
    default:
      return exhaustiveStateCheck(input.currentState);
  }
}

function resolveExhaustionDelta(
  input: ContinuityInteractionInput,
  pressureDelta: number,
): number {
  if (input.intent === ContinuityInteractionIntent.Meditate) {
    return -0.35;
  }

  if (input.intent === ContinuityInteractionIntent.Observe) {
    return 0;
  }

  return clamp01(pressureDelta * 0.35);
}

function encounterPhaseFor(state: ContinuityInteractionState): EncounterPhase {
  switch (state) {
    case ContinuityInteractionState.Observe:
      return EncounterPhase.Dormant;
    case ContinuityInteractionState.Approach:
      return EncounterPhase.Entering;
    case ContinuityInteractionState.Commit:
    case ContinuityInteractionState.PressureResponse:
    case ContinuityInteractionState.InterruptionCheck:
      return EncounterPhase.Escalating;
    case ContinuityInteractionState.Resolution:
    case ContinuityInteractionState.MemoryRecording:
      return EncounterPhase.Stabilizing;
    case ContinuityInteractionState.ExhaustionRecovery:
    case ContinuityInteractionState.WorldContinues:
      return EncounterPhase.Resolved;
    default:
      return exhaustiveStateCheck(state);
  }
}

function clamp01(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

function exhaustiveStateCheck(value: never): never {
  throw new Error(`Unhandled continuity interaction state: ${String(value)}`);
}
