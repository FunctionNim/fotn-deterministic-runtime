import { clamp01 } from '../runtime/continuity-state.js';
import { EventType, ResonanceType } from '../runtime/resonance-types.js';
export class DistrictRuntime {
    update(input) {
        const district = evolveDistrict(input.district);
        const emittedEvents = emitDistrictEvents(district, input.generatedAtTick);
        return {
            district,
            emittedEvents,
        };
    }
}
export function evolveDistrict(district) {
    const pressureFromMigration = district.migrationPressure * 0.02;
    const restorationRelief = district.restorationProgress * 0.03;
    const pressureLevel = clamp01(district.pressureLevel + pressureFromMigration - restorationRelief);
    const resonanceStability = clamp01(district.environmentStability
        + district.restorationProgress * 0.1
        - pressureLevel * 0.15
        - district.memoryPressure * 0.05);
    return {
        ...district,
        pressureLevel,
        resonanceStability,
    };
}
function emitDistrictEvents(district, generatedAtTick) {
    const events = [];
    if (district.pressureLevel >= 0.7) {
        events.push({
            eventId: `district:${district.districtId}:pressure:${generatedAtTick}`,
            type: EventType.PressureShift,
            resonance: ResonanceType.Pressured,
            emotionalWeight: district.pressureLevel,
            propagationStrength: district.pressureLevel,
            affectedDistricts: [district.districtId],
            generatedAtTick,
        });
    }
    if (district.restorationProgress >= 0.7 && district.pressureLevel <= 0.4) {
        events.push({
            eventId: `district:${district.districtId}:restoration:${generatedAtTick}`,
            type: EventType.RestorationApplied,
            resonance: ResonanceType.Restoring,
            emotionalWeight: district.restorationProgress,
            propagationStrength: district.restorationProgress * 0.5,
            affectedDistricts: [district.districtId],
            generatedAtTick,
        });
    }
    if (district.memoryPressure >= 0.6) {
        events.push({
            eventId: `district:${district.districtId}:memory:${generatedAtTick}`,
            type: EventType.MemoryPropagated,
            resonance: ResonanceType.Stable,
            emotionalWeight: district.memoryPressure,
            propagationStrength: district.memoryPressure * 0.4,
            affectedDistricts: [district.districtId],
            generatedAtTick,
        });
    }
    return events;
}
