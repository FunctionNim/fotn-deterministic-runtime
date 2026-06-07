import { ResonanceType } from '../runtime/resonance-types.js';
export var MemoryPersistenceStage;
(function (MemoryPersistenceStage) {
    MemoryPersistenceStage["FreshRecord"] = "FreshRecord";
    MemoryPersistenceStage["WitnessedMemory"] = "WitnessedMemory";
    MemoryPersistenceStage["PublicInterpretation"] = "PublicInterpretation";
    MemoryPersistenceStage["HistoricalPressure"] = "HistoricalPressure";
    MemoryPersistenceStage["LivingContinuity"] = "LivingContinuity";
})(MemoryPersistenceStage || (MemoryPersistenceStage = {}));
export class ContinuityMemoryEngine {
    preserve(input) {
        const contradictionPressure = clamp01(input.priorInfluences.filter((influence) => influence.distorted).length * 0.12
            + input.pressureWeight * 0.45
            - input.restorationWeight * 0.25);
        const historicalWeight = clamp01(input.witnessCount / 10
            + input.pressureWeight * 0.35
            + input.restorationWeight * 0.35
            + input.priorInfluences.length * 0.03);
        const resonanceType = input.restorationWeight >= input.pressureWeight
            ? ResonanceType.Restoring
            : ResonanceType.Pressured;
        const memoryRecord = {
            recordId: input.memoryId,
            type: input.sourceEventType,
            historicalWeight,
            influencedDistricts: [input.districtId],
            emotionalResonance: {
                emotionalWeight: historicalWeight,
                resonanceType,
            },
        };
        return {
            memoryRecord,
            stage: stageFor(historicalWeight, contradictionPressure),
            distorted: contradictionPressure >= 0.55,
            contradictionPressure,
            shouldPropagate: historicalWeight >= 0.45,
        };
    }
}
function stageFor(historicalWeight, contradictionPressure) {
    if (historicalWeight >= 0.85 && contradictionPressure < 0.35) {
        return MemoryPersistenceStage.LivingContinuity;
    }
    if (historicalWeight >= 0.7)
        return MemoryPersistenceStage.HistoricalPressure;
    if (historicalWeight >= 0.5)
        return MemoryPersistenceStage.PublicInterpretation;
    if (historicalWeight >= 0.25)
        return MemoryPersistenceStage.WitnessedMemory;
    return MemoryPersistenceStage.FreshRecord;
}
function clamp01(value) {
    if (Number.isNaN(value))
        return 0;
    return Math.max(0, Math.min(1, value));
}
