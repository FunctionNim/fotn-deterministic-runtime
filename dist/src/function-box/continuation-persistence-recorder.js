import { EventType, ResonanceType } from '../runtime/resonance-types.js';
export class ContinuationPersistenceRecorder {
    record(input) {
        const records = [];
        if (input.result.modifiers.length > 0) {
            records.push({
                recordId: `sequence:${input.sequenceId}:flow:${input.generatedAtTick}`,
                type: EventType.FunctionRelationshipChanged,
                historicalWeight: clamp01(input.result.modifiers.length / 10),
                influencedDistricts: [input.districtId],
                emotionalResonance: {
                    emotionalWeight: clamp01(input.result.modifiers.length / 10),
                    resonanceType: ResonanceType.Synchronized,
                },
            });
        }
        if (input.result.pressureWarnings.length > 0) {
            records.push({
                recordId: `sequence:${input.sequenceId}:fracture:${input.generatedAtTick}`,
                type: EventType.PressureShift,
                historicalWeight: clamp01(input.result.pressureWarnings.length / 5),
                influencedDistricts: [input.districtId],
                emotionalResonance: {
                    emotionalWeight: clamp01(input.result.pressureWarnings.length / 5),
                    resonanceType: ResonanceType.Fractured,
                },
            });
        }
        return records;
    }
}
function clamp01(value) {
    if (Number.isNaN(value))
        return 0;
    return Math.max(0, Math.min(1, value));
}
