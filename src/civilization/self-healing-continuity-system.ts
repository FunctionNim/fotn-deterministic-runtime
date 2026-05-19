import { WatcherRecursionStage } from './watcher-recursion-system.js';
import { ContinuationAnchorType } from './continuation-anchor-system.js';
import { ResonanceType } from '../runtime/resonance-types.js';

export enum ContinuityRepairAction {
  Observe = 'Observe',
  Audit = 'Audit',
  RestoreAnchor = 'RestoreAnchor',
  CompressHistory = 'CompressHistory',
  StabilizeMeaning = 'StabilizeMeaning',
}

export interface SelfHealingContinuityInput {
  readonly continuityId: string;
  readonly recursionStage: WatcherRecursionStage;
  readonly damagedAnchorTypes: ContinuationAnchorType[];
  readonly corruption: number;
  readonly attributionClarity: number;
  readonly dominantResonance: ResonanceType;
}

export interface SelfHealingContinuityResult {
  readonly continuityId: string;
  readonly repairAction: ContinuityRepairAction;
  readonly repairStrength: number;
  readonly auditRequired: boolean;
  readonly stabilized: boolean;
}

export class SelfHealingContinuitySystem {
  public repair(input: SelfHealingContinuityInput): SelfHealingContinuityResult {
    const repairStrength = clamp01(
      recursionStrength(input.recursionStage) * 0.35
        + anchorRecoveryPotential(input.damagedAnchorTypes) * 0.25
        + (1 - input.corruption) * 0.25
        + input.attributionClarity * 0.15,
    );

    return {
      continuityId: input.continuityId,
      repairAction: chooseRepairAction(input, repairStrength),
      repairStrength,
      auditRequired: input.attributionClarity < 0.6 || input.corruption > 0.5,
      stabilized: repairStrength >= 0.65,
    };
  }
}

function chooseRepairAction(
  input: SelfHealingContinuityInput,
  repairStrength: number,
): ContinuityRepairAction {
  if (input.attributionClarity < 0.45) return ContinuityRepairAction.Audit;
  if (input.damagedAnchorTypes.length > 0) return ContinuityRepairAction.RestoreAnchor;
  if (input.corruption > 0.65) return ContinuityRepairAction.CompressHistory;
  if (repairStrength >= 0.65) return ContinuityRepairAction.StabilizeMeaning;
  return ContinuityRepairAction.Observe;
}

function recursionStrength(stage: WatcherRecursionStage): number {
  switch (stage) {
    case WatcherRecursionStage.ObservedEvent:
      return 0.2;
    case WatcherRecursionStage.AttributedPattern:
      return 0.4;
    case WatcherRecursionStage.CompressedHistory:
      return 0.6;
    case WatcherRecursionStage.RecursiveWitness:
      return 0.8;
    case WatcherRecursionStage.SelfRememberingSystem:
      return 1;
    default:
      return exhaustiveRecursionStageCheck(stage);
  }
}

function anchorRecoveryPotential(anchorTypes: ContinuationAnchorType[]): number {
  if (anchorTypes.length === 0) return 0.5;
  return clamp01(new Set(anchorTypes).size / 5);
}

function clamp01(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

function exhaustiveRecursionStageCheck(value: never): never {
  throw new Error(`Unhandled watcher recursion stage: ${String(value)}`);
}
