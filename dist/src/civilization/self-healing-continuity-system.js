import { WatcherRecursionStage } from './watcher-recursion-system.js';
export var ContinuityRepairAction;
(function (ContinuityRepairAction) {
    ContinuityRepairAction["Observe"] = "Observe";
    ContinuityRepairAction["Audit"] = "Audit";
    ContinuityRepairAction["RestoreAnchor"] = "RestoreAnchor";
    ContinuityRepairAction["CompressHistory"] = "CompressHistory";
    ContinuityRepairAction["StabilizeMeaning"] = "StabilizeMeaning";
})(ContinuityRepairAction || (ContinuityRepairAction = {}));
export class SelfHealingContinuitySystem {
    repair(input) {
        const repairStrength = clamp01(recursionStrength(input.recursionStage) * 0.35
            + anchorRecoveryPotential(input.damagedAnchorTypes) * 0.25
            + (1 - input.corruption) * 0.25
            + input.attributionClarity * 0.15);
        return {
            continuityId: input.continuityId,
            repairAction: chooseRepairAction(input, repairStrength),
            repairStrength,
            auditRequired: input.attributionClarity < 0.6 || input.corruption > 0.5,
            stabilized: repairStrength >= 0.65,
        };
    }
}
function chooseRepairAction(input, repairStrength) {
    if (input.attributionClarity < 0.45)
        return ContinuityRepairAction.Audit;
    if (input.damagedAnchorTypes.length > 0)
        return ContinuityRepairAction.RestoreAnchor;
    if (input.corruption > 0.65)
        return ContinuityRepairAction.CompressHistory;
    if (repairStrength >= 0.65)
        return ContinuityRepairAction.StabilizeMeaning;
    return ContinuityRepairAction.Observe;
}
function recursionStrength(stage) {
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
function anchorRecoveryPotential(anchorTypes) {
    if (anchorTypes.length === 0)
        return 0.5;
    return clamp01(new Set(anchorTypes).size / 5);
}
function clamp01(value) {
    if (Number.isNaN(value))
        return 0;
    return Math.max(0, Math.min(1, value));
}
function exhaustiveRecursionStageCheck(value) {
    throw new Error(`Unhandled watcher recursion stage: ${String(value)}`);
}
