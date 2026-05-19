import { EternalConvergenceStage } from './eternal-continuity-convergence-system.js';
import { WatcherRecursionStage } from './watcher-recursion-system.js';
import { ContinuityRepairAction } from './self-healing-continuity-system.js';

export enum InfiniteSynchronizationStage {
  FragmentedContinuity = 'FragmentedContinuity',
  RecoveringContinuity = 'RecoveringContinuity',
  SynchronizedContinuity = 'SynchronizedContinuity',
  SelfHealingContinuity = 'SelfHealingContinuity',
  InfiniteContinuation = 'InfiniteContinuation',
}

export interface InfiniteContinuationSynchronizationInput {
  readonly synchronizationId: string;
  readonly convergenceStage: EternalConvergenceStage;
  readonly watcherStage: WatcherRecursionStage;
  readonly repairAction: ContinuityRepairAction;
  readonly convergenceStrength: number;
  readonly recursionStrength: number;
  readonly repairStrength: number;
}

export interface InfiniteContinuationSynchronizationResult {
  readonly synchronizationId: string;
  readonly stage: InfiniteSynchronizationStage;
  readonly synchronizationStrength: number;
  readonly stableAcrossSystems: boolean;
  readonly auditRequired: boolean;
}

export class InfiniteContinuationSynchronizationSystem {
  public synchronize(
    input: InfiniteContinuationSynchronizationInput,
  ): InfiniteContinuationSynchronizationResult {
    const synchronizationStrength = clamp01(
      input.convergenceStrength * 0.35
        + input.recursionStrength * 0.35
        + input.repairStrength * 0.3,
    );

    return {
      synchronizationId: input.synchronizationId,
      stage: stageFor(synchronizationStrength, input),
      synchronizationStrength,
      stableAcrossSystems: synchronizationStrength >= 0.7,
      auditRequired: input.recursionStrength < 0.55 || input.repairStrength < 0.55,
    };
  }
}

function stageFor(
  strength: number,
  input: InfiniteContinuationSynchronizationInput,
): InfiniteSynchronizationStage {
  if (strength >= 0.9
    && input.convergenceStage === EternalConvergenceStage.EternalContinuation
    && input.watcherStage === WatcherRecursionStage.SelfRememberingSystem) {
    return InfiniteSynchronizationStage.InfiniteContinuation;
  }

  if (strength >= 0.75
    && input.repairAction === ContinuityRepairAction.StabilizeMeaning) {
    return InfiniteSynchronizationStage.SelfHealingContinuity;
  }

  if (strength >= 0.6) return InfiniteSynchronizationStage.SynchronizedContinuity;
  if (strength >= 0.35) return InfiniteSynchronizationStage.RecoveringContinuity;
  return InfiniteSynchronizationStage.FragmentedContinuity;
}

function clamp01(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(1, value));
}
