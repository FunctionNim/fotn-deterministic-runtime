import { EternalConvergenceStage } from './eternal-continuity-convergence-system.js';
import { WatcherRecursionStage } from './watcher-recursion-system.js';
import { ContinuityRepairAction } from './self-healing-continuity-system.js';
export var InfiniteSynchronizationStage;
(function (InfiniteSynchronizationStage) {
    InfiniteSynchronizationStage["FragmentedContinuity"] = "FragmentedContinuity";
    InfiniteSynchronizationStage["RecoveringContinuity"] = "RecoveringContinuity";
    InfiniteSynchronizationStage["SynchronizedContinuity"] = "SynchronizedContinuity";
    InfiniteSynchronizationStage["SelfHealingContinuity"] = "SelfHealingContinuity";
    InfiniteSynchronizationStage["InfiniteContinuation"] = "InfiniteContinuation";
})(InfiniteSynchronizationStage || (InfiniteSynchronizationStage = {}));
export class InfiniteContinuationSynchronizationSystem {
    synchronize(input) {
        const synchronizationStrength = clamp01(input.convergenceStrength * 0.35
            + input.recursionStrength * 0.35
            + input.repairStrength * 0.3);
        return {
            synchronizationId: input.synchronizationId,
            stage: stageFor(synchronizationStrength, input),
            synchronizationStrength,
            stableAcrossSystems: synchronizationStrength >= 0.7,
            auditRequired: input.recursionStrength < 0.55 || input.repairStrength < 0.55,
        };
    }
}
function stageFor(strength, input) {
    if (strength >= 0.9
        && input.convergenceStage === EternalConvergenceStage.EternalContinuation
        && input.watcherStage === WatcherRecursionStage.SelfRememberingSystem) {
        return InfiniteSynchronizationStage.InfiniteContinuation;
    }
    if (strength >= 0.75
        && input.repairAction === ContinuityRepairAction.StabilizeMeaning) {
        return InfiniteSynchronizationStage.SelfHealingContinuity;
    }
    if (strength >= 0.6)
        return InfiniteSynchronizationStage.SynchronizedContinuity;
    if (strength >= 0.35)
        return InfiniteSynchronizationStage.RecoveringContinuity;
    return InfiniteSynchronizationStage.FragmentedContinuity;
}
function clamp01(value) {
    if (Number.isNaN(value))
        return 0;
    return Math.max(0, Math.min(1, value));
}
