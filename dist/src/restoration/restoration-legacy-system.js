import { EventType, ResonanceType } from '../runtime/resonance-types.js';
export var RestorationLegacyStage;
(function (RestorationLegacyStage) {
    RestorationLegacyStage["FreshRestoration"] = "FreshRestoration";
    RestorationLegacyStage["RememberedCare"] = "RememberedCare";
    RestorationLegacyStage["DistrictPractice"] = "DistrictPractice";
    RestorationLegacyStage["CulturalTradition"] = "CulturalTradition";
    RestorationLegacyStage["ContinuityAnchor"] = "ContinuityAnchor";
})(RestorationLegacyStage || (RestorationLegacyStage = {}));
export class RestorationLegacySystem {
    evolve(input) {
        const restorationRecords = input.restorationMemories.filter((memory) => memory.type === EventType.RestorationApplied);
        const memoryWeight = clamp01(restorationRecords.reduce((total, memory) => total + memory.historicalWeight, 0)
            / Math.max(1, restorationRecords.length));
        const resilience = clamp01(memoryWeight + restorationRecords.length * 0.05);
        return {
            districtId: input.districtId,
            nextStage: nextStage(input.currentStage, resilience),
            resilience,
            memoryWeight,
            resonanceType: ResonanceType.Restoring,
        };
    }
}
function nextStage(current, resilience) {
    if (resilience < 0.35)
        return current;
    switch (current) {
        case RestorationLegacyStage.FreshRestoration:
            return RestorationLegacyStage.RememberedCare;
        case RestorationLegacyStage.RememberedCare:
            return RestorationLegacyStage.DistrictPractice;
        case RestorationLegacyStage.DistrictPractice:
            return RestorationLegacyStage.CulturalTradition;
        case RestorationLegacyStage.CulturalTradition:
            return RestorationLegacyStage.ContinuityAnchor;
        case RestorationLegacyStage.ContinuityAnchor:
            return RestorationLegacyStage.ContinuityAnchor;
        default:
            return exhaustiveStageCheck(current);
    }
}
function clamp01(value) {
    if (Number.isNaN(value))
        return 0;
    return Math.max(0, Math.min(1, value));
}
function exhaustiveStageCheck(value) {
    throw new Error(`Unhandled restoration legacy stage: ${String(value)}`);
}
