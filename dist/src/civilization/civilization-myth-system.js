import { EventType, ResonanceType } from '../runtime/resonance-types.js';
export var MythStage;
(function (MythStage) {
    MythStage["Memory"] = "Memory";
    MythStage["RetoldStory"] = "RetoldStory";
    MythStage["Folktale"] = "Folktale";
    MythStage["Legend"] = "Legend";
    MythStage["Archetype"] = "Archetype";
})(MythStage || (MythStage = {}));
export class CivilizationMythSystem {
    evolve(input) {
        const mythWeight = clamp01(input.memories.reduce((total, memory) => total + memory.historicalWeight, 0)
            / Math.max(1, input.memories.length));
        const restorationWeight = weightFor(input.memories, EventType.RestorationApplied);
        const pressureWeight = weightFor(input.memories, EventType.PressureShift);
        return {
            mythId: input.mythId,
            nextStage: nextStage(input.currentStage, mythWeight),
            mythWeight,
            dominantResonance: restorationWeight >= pressureWeight
                ? ResonanceType.Restoring
                : ResonanceType.Pressured,
            preservationNeeded: mythWeight >= 0.7,
        };
    }
}
function nextStage(current, mythWeight) {
    if (mythWeight < 0.3)
        return current;
    switch (current) {
        case MythStage.Memory:
            return MythStage.RetoldStory;
        case MythStage.RetoldStory:
            return MythStage.Folktale;
        case MythStage.Folktale:
            return MythStage.Legend;
        case MythStage.Legend:
            return MythStage.Archetype;
        case MythStage.Archetype:
            return MythStage.Archetype;
        default:
            return exhaustiveStageCheck(current);
    }
}
function weightFor(records, type) {
    const matching = records.filter((record) => record.type === type);
    if (matching.length === 0)
        return 0;
    return clamp01(matching.reduce((total, record) => total + record.historicalWeight, 0)
        / matching.length);
}
function clamp01(value) {
    if (Number.isNaN(value))
        return 0;
    return Math.max(0, Math.min(1, value));
}
function exhaustiveStageCheck(value) {
    throw new Error(`Unhandled myth stage: ${String(value)}`);
}
