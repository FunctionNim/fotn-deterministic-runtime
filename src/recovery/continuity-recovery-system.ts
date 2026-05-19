import type { SeekerState } from '../runtime/continuity-state.js';

export enum RecoveryActivity {
  Meditate = 'Meditate',
  Rest = 'Rest',
  ObserveQuietly = 'ObserveQuietly',
  ReturnToPressure = 'ReturnToPressure',
}

export enum RecoveryReadiness {
  Exhausted = 'Exhausted',
  Realigning = 'Realigning',
  ClearEnough = 'ClearEnough',
  Unavoidable = 'Unavoidable',
}

export interface ContinuityRecoveryInput {
  readonly seeker: SeekerState;
  readonly activity: RecoveryActivity;
  readonly meditationFocus: number;
  readonly witnessedReturnCount: number;
}

export interface ContinuityRecoveryResult {
  readonly seekerId: string;
  readonly readiness: RecoveryReadiness;
  readonly exhaustionDelta: number;
  readonly mentalismClarityDelta: number;
  readonly canReturnToEncounter: boolean;
  readonly persistenceRecognized: boolean;
}

export class ContinuityRecoverySystem {
  public recover(input: ContinuityRecoveryInput): ContinuityRecoveryResult {
    const recoveryStrength = recoveryStrengthFor(input);
    const resultingExhaustion = clamp01(input.seeker.exhaustionLevel - recoveryStrength);
    const persistenceRecognized = input.witnessedReturnCount >= 3;

    return {
      seekerId: input.seeker.seekerId,
      readiness: readinessFor(resultingExhaustion, persistenceRecognized),
      exhaustionDelta: -recoveryStrength,
      mentalismClarityDelta: recoveryStrength * 0.6,
      canReturnToEncounter: resultingExhaustion <= 0.45,
      persistenceRecognized,
    };
  }
}

function recoveryStrengthFor(input: ContinuityRecoveryInput): number {
  switch (input.activity) {
    case RecoveryActivity.Meditate:
      return clamp01(0.25 + input.meditationFocus * 0.35);
    case RecoveryActivity.Rest:
      return 0.2;
    case RecoveryActivity.ObserveQuietly:
      return 0.12;
    case RecoveryActivity.ReturnToPressure:
      return 0;
    default:
      return exhaustiveActivityCheck(input.activity);
  }
}

function readinessFor(
  exhaustion: number,
  persistenceRecognized: boolean,
): RecoveryReadiness {
  if (persistenceRecognized && exhaustion <= 0.35) return RecoveryReadiness.Unavoidable;
  if (exhaustion <= 0.35) return RecoveryReadiness.ClearEnough;
  if (exhaustion <= 0.75) return RecoveryReadiness.Realigning;
  return RecoveryReadiness.Exhausted;
}

function clamp01(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

function exhaustiveActivityCheck(value: never): never {
  throw new Error(`Unhandled recovery activity: ${String(value)}`);
}
