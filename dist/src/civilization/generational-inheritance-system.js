import { EventType, ResonanceType } from '../runtime/resonance-types.js';
export class GenerationalInheritanceSystem {
    inherit(input) {
        const inheritedRecords = input.inheritedMemories
            .filter((memory) => memory.historicalWeight >= 0.35)
            .map((memory) => ({
            ...memory,
            recordId: `${memory.recordId}:generation:${input.generationId}`,
            historicalWeight: Math.max(0, memory.historicalWeight - 0.1),
        }));
        const restorationInheritance = weightFor(inheritedRecords, EventType.RestorationApplied);
        const pressureInheritance = weightFor(inheritedRecords, EventType.PressureShift);
        return {
            generationId: input.generationId,
            parentGenerationId: input.parentGenerationId,
            inheritedRecords,
            restorationInheritance,
            pressureInheritance,
            dominantResonance: restorationInheritance >= pressureInheritance
                ? ResonanceType.Restoring
                : ResonanceType.Pressured,
        };
    }
}
function weightFor(records, type) {
    const matching = records.filter((record) => record.type === type);
    if (matching.length === 0)
        return 0;
    return matching.reduce((total, record) => total + record.historicalWeight, 0)
        / matching.length;
}
