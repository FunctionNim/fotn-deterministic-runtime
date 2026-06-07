import { ArchiveClassification } from './long-term-continuity-archive-system.js';
export var EternalConvergenceStage;
(function (EternalConvergenceStage) {
    EternalConvergenceStage["SeparateHistories"] = "SeparateHistories";
    EternalConvergenceStage["SharedPattern"] = "SharedPattern";
    EternalConvergenceStage["HarmonicCulture"] = "HarmonicCulture";
    EternalConvergenceStage["CollectiveMeaning"] = "CollectiveMeaning";
    EternalConvergenceStage["EternalContinuation"] = "EternalContinuation";
})(EternalConvergenceStage || (EternalConvergenceStage = {}));
export class EternalContinuityConvergenceSystem {
    converge(input) {
        const convergenceStrength = clamp01(archetypeStrength(input.archetypes)
            * 0.35
            + archiveStrength(input.archiveClassification)
                * 0.35
            + anchorStrength(input.anchorTypes)
                * 0.3);
        return {
            convergenceId: input.convergenceId,
            stage: stageFor(convergenceStrength),
            convergenceStrength,
            preservesIndividuality: input.archetypes.length >= 2,
            dominantResonance: input.dominantResonance,
        };
    }
}
function archetypeStrength(archetypes) {
    if (archetypes.length === 0)
        return 0;
    const uniqueCount = new Set(archetypes).size;
    return clamp01(uniqueCount / 5);
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
function anchorStrength(anchorTypes) {
    if (anchorTypes.length === 0)
        return 0;
    return clamp01(new Set(anchorTypes).size / 5);
}
function stageFor(strength) {
    if (strength >= 0.85)
        return EternalConvergenceStage.EternalContinuation;
    if (strength >= 0.7)
        return EternalConvergenceStage.CollectiveMeaning;
    if (strength >= 0.55)
        return EternalConvergenceStage.HarmonicCulture;
    if (strength >= 0.35)
        return EternalConvergenceStage.SharedPattern;
    return EternalConvergenceStage.SeparateHistories;
}
function clamp01(value) {
    if (Number.isNaN(value))
        return 0;
    return Math.max(0, Math.min(1, value));
}
function exhaustiveArchiveCheck(value) {
    throw new Error(`Unhandled archive classification: ${String(value)}`);
}
