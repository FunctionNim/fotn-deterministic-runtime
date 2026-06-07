import { clamp01 } from '../runtime/continuity-state.js';
import { EncounterPhase, EventType, ResonanceType } from '../runtime/resonance-types.js';
export class EncounterRuntime {
    update(input) {
        const encounter = evolveEncounter(input.encounter);
        const emittedEvents = emitEncounterEvents(encounter, input.districtId, input.generatedAtTick);
        return {
            encounter,
            emittedEvents,
        };
    }
}
export function evolveEncounter(encounter) {
    if (encounter.resolved || encounter.phase === EncounterPhase.Resolved) {
        return encounter;
    }
    const pressureLevel = clamp01(encounter.pressureLevel + 0.05);
    const stability = clamp01(encounter.resonance.stability - pressureLevel * 0.03);
    const distortion = clamp01(encounter.resonance.distortion + pressureLevel * 0.04);
    const phase = nextEncounterPhase(encounter.phase, pressureLevel, stability);
    return {
        ...encounter,
        phase,
        pressureLevel,
        resonance: {
            ...encounter.resonance,
            stability,
            distortion,
            emotionalIntensity: clamp01(encounter.resonance.emotionalIntensity + pressureLevel * 0.02),
            primaryType: phase === EncounterPhase.Stabilizing
                ? ResonanceType.Restoring
                : ResonanceType.Pressured,
        },
        resolved: phase === EncounterPhase.Resolved,
    };
}
function nextEncounterPhase(current, pressureLevel, stability) {
    if (stability >= 0.75 && current === EncounterPhase.Stabilizing) {
        return EncounterPhase.Resolved;
    }
    if (pressureLevel >= 0.65)
        return EncounterPhase.Escalating;
    if (current === EncounterPhase.Dormant)
        return EncounterPhase.Entering;
    return current;
}
export function stabilizeEncounter(encounter, amount) {
    const stability = clamp01(encounter.resonance.stability + amount);
    const pressureLevel = clamp01(encounter.pressureLevel - amount * 0.5);
    const phase = stability >= 0.75
        ? EncounterPhase.Stabilizing
        : encounter.phase;
    return {
        ...encounter,
        phase,
        pressureLevel,
        resonance: {
            ...encounter.resonance,
            stability,
            distortion: clamp01(encounter.resonance.distortion - amount),
            primaryType: ResonanceType.Restoring,
        },
    };
}
function emitEncounterEvents(encounter, districtId, generatedAtTick) {
    if (encounter.resolved || encounter.phase === EncounterPhase.Resolved) {
        return [{
                eventId: `encounter:${encounter.encounterId}:resolved:${generatedAtTick}`,
                type: EventType.EncounterResolved,
                resonance: ResonanceType.Restoring,
                emotionalWeight: encounter.resonance.emotionalIntensity,
                propagationStrength: 0.7,
                affectedDistricts: [districtId],
                generatedAtTick,
            }];
    }
    if (encounter.phase === EncounterPhase.Escalating) {
        return [{
                eventId: `encounter:${encounter.encounterId}:escalating:${generatedAtTick}`,
                type: EventType.PressureShift,
                resonance: ResonanceType.Pressured,
                emotionalWeight: encounter.resonance.emotionalIntensity,
                propagationStrength: encounter.pressureLevel,
                affectedDistricts: [districtId],
                generatedAtTick,
            }];
    }
    return [];
}
