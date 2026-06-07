import { EternalConvergenceStage } from './eternal-continuity-convergence-system.js';
import { ArchiveClassification } from './long-term-continuity-archive-system.js';
export var WatcherRecursionStage;
(function (WatcherRecursionStage) {
    WatcherRecursionStage["ObservedEvent"] = "ObservedEvent";
    WatcherRecursionStage["AttributedPattern"] = "AttributedPattern";
    WatcherRecursionStage["CompressedHistory"] = "CompressedHistory";
    WatcherRecursionStage["RecursiveWitness"] = "RecursiveWitness";
    WatcherRecursionStage["SelfRememberingSystem"] = "SelfRememberingSystem";
})(WatcherRecursionStage || (WatcherRecursionStage = {}));
export class WatcherRecursionSystem {
    observe(input) {
        const recursionStrength = clamp01(convergenceStrength(input.convergenceStage) * 0.35
            + archiveStrength(input.archiveClassification) * 0.25
            + clamp01(input.observedContinuityCount / 10) * 0.2
            + input.attributionClarity * 0.2);
        return {
            recursionId: input.recursionId,
            stage: stageFor(recursionStrength),
            recursionStrength,
            auditRequired: input.attributionClarity < 0.6,
            compressedEnoughForArchive: recursionStrength >= 0.7,
        };
    }
}
function convergenceStrength(stage) {
    switch (stage) {
        case EternalConvergenceStage.SeparateHistories:
            return 0.2;
        case EternalConvergenceStage.SharedPattern:
            return 0.4;
        case EternalConvergenceStage.HarmonicCulture:
            return 0.6;
        case EternalConvergenceStage.CollectiveMeaning:
            return 0.8;
        case EternalConvergenceStage.EternalContinuation:
            return 1;
        default:
            return exhaustiveConvergenceStageCheck(stage);
    }
}
function archiveStrength(classification) {
    switch (classification) {
        case ArchiveClassification.LocalMemory:
            return 0.2;
        case ArchiveClassification.DistrictHistory:
            return 0.4;
        case ArchiveClassification.CivilizationRecord:
            return 0.6;
        case ArchiveClassification.ContinuityAnchor:
            return 0.8;
        case ArchiveClassification.MythicArchive:
            return 1;
        default:
            return exhaustiveArchiveCheck(classification);
    }
}
function stageFor(strength) {
    if (strength >= 0.85)
        return WatcherRecursionStage.SelfRememberingSystem;
    if (strength >= 0.7)
        return WatcherRecursionStage.RecursiveWitness;
    if (strength >= 0.55)
        return WatcherRecursionStage.CompressedHistory;
    if (strength >= 0.35)
        return WatcherRecursionStage.AttributedPattern;
    return WatcherRecursionStage.ObservedEvent;
}
function clamp01(value) {
    if (Number.isNaN(value))
        return 0;
    return Math.max(0, Math.min(1, value));
}
function exhaustiveConvergenceStageCheck(value) {
    throw new Error(`Unhandled eternal convergence stage: ${String(value)}`);
}
function exhaustiveArchiveCheck(value) {
    throw new Error(`Unhandled archive classification: ${String(value)}`);
}
