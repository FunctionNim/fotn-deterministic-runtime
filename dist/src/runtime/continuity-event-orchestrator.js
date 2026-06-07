import { shouldPersistEvent } from './continuity-event.js';
import { clamp01 } from './continuity-state.js';
import { EventType } from './resonance-types.js';
export class ContinuityEventOrchestrator {
    execute(state, events) {
        const orderedEvents = [...events].sort(compareContinuityEvents);
        const executedEventIds = [];
        const persistedMemories = [];
        for (const event of orderedEvents) {
            this.applyEvent(state, event);
            executedEventIds.push(event.eventId);
            if (shouldPersistEvent(event)) {
                persistedMemories.push(toWorldMemoryRecord(event));
            }
        }
        return {
            executedEventIds,
            persistedMemories,
            state,
        };
    }
    applyEvent(state, event) {
        for (const districtId of event.affectedDistricts) {
            const district = state.districts[districtId];
            if (!district)
                continue;
            switch (event.type) {
                case EventType.PressureShift:
                case EventType.EncounterEntered:
                    district.pressureLevel = clamp01(district.pressureLevel + event.propagationStrength * 0.1);
                    district.resonanceStability = clamp01(district.resonanceStability - event.emotionalWeight * 0.05);
                    break;
                case EventType.EncounterResolved:
                case EventType.RestorationApplied:
                    district.pressureLevel = clamp01(district.pressureLevel - event.propagationStrength * 0.1);
                    district.restorationProgress = clamp01(district.restorationProgress + event.emotionalWeight * 0.1);
                    district.resonanceStability = clamp01(district.resonanceStability + event.emotionalWeight * 0.05);
                    break;
                case EventType.MemoryPropagated:
                case EventType.SymbolMeaningShifted:
                    district.memoryPressure = clamp01(district.memoryPressure + event.emotionalWeight * 0.05);
                    break;
                case EventType.FunctionRelationshipChanged:
                    district.resonanceStability = clamp01(district.resonanceStability + event.propagationStrength * 0.02 - event.emotionalWeight * 0.02);
                    break;
                default:
                    exhaustiveEventTypeCheck(event.type);
            }
        }
    }
}
export function compareContinuityEvents(a, b) {
    const priorityDelta = eventPriority(a.type) - eventPriority(b.type);
    if (priorityDelta !== 0)
        return priorityDelta;
    const tickDelta = a.generatedAtTick - b.generatedAtTick;
    if (tickDelta !== 0)
        return tickDelta;
    return a.eventId.localeCompare(b.eventId);
}
export function eventPriority(type) {
    switch (type) {
        case EventType.PressureShift:
            return 10;
        case EventType.FunctionRelationshipChanged:
            return 20;
        case EventType.EncounterEntered:
            return 30;
        case EventType.EncounterResolved:
            return 40;
        case EventType.RestorationApplied:
            return 50;
        case EventType.MemoryPropagated:
            return 60;
        case EventType.SymbolMeaningShifted:
            return 70;
        default:
            return exhaustiveEventTypeCheck(type);
    }
}
function toWorldMemoryRecord(event) {
    return {
        recordId: `memory:${event.eventId}`,
        type: event.type,
        historicalWeight: clamp01((event.emotionalWeight + event.propagationStrength) / 2),
        influencedDistricts: [...event.affectedDistricts].sort(),
        emotionalResonance: {
            emotionalWeight: event.emotionalWeight,
            resonanceType: event.resonance,
        },
    };
}
function exhaustiveEventTypeCheck(value) {
    throw new Error(`Unhandled continuity event type: ${String(value)}`);
}
