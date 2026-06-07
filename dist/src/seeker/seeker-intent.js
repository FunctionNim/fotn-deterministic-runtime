import { EventType, ResonanceType } from '../runtime/index.js';
export var SeekerIntentType;
(function (SeekerIntentType) {
    SeekerIntentType["Move"] = "Move";
    SeekerIntentType["Observe"] = "Observe";
    SeekerIntentType["Interact"] = "Interact";
    SeekerIntentType["Restore"] = "Restore";
    SeekerIntentType["ActivateFunctionSlot"] = "ActivateFunctionSlot";
})(SeekerIntentType || (SeekerIntentType = {}));
export var InputSurface;
(function (InputSurface) {
    InputSurface["Desktop"] = "Desktop";
    InputSurface["Mobile"] = "Mobile";
    InputSurface["Controller"] = "Controller";
})(InputSurface || (InputSurface = {}));
export function intentToContinuityEvent(intent) {
    switch (intent.type) {
        case SeekerIntentType.Move:
            return baseEvent(intent, EventType.PressureShift, ResonanceType.Stable, 0.1, 0.1);
        case SeekerIntentType.Observe:
            return baseEvent(intent, EventType.MemoryPropagated, ResonanceType.Stable, 0.2, 0.15);
        case SeekerIntentType.Interact:
            return baseEvent(intent, EventType.EncounterEntered, ResonanceType.Pressured, 0.4, 0.35);
        case SeekerIntentType.Restore:
            return baseEvent(intent, EventType.RestorationApplied, ResonanceType.Restoring, 0.6, 0.5);
        case SeekerIntentType.ActivateFunctionSlot:
            return baseEvent(intent, EventType.FunctionRelationshipChanged, ResonanceType.Synchronized, 0.35, 0.3);
        default:
            return exhaustiveIntentCheck(intent.type);
    }
}
function baseEvent(intent, type, resonance, emotionalWeight, propagationStrength) {
    return {
        eventId: `intent:${intent.intentId}`,
        type,
        resonance,
        emotionalWeight,
        propagationStrength,
        affectedDistricts: intent.targetId ? [intent.targetId] : [],
        generatedAtTick: intent.generatedAtTick,
    };
}
function exhaustiveIntentCheck(value) {
    throw new Error(`Unhandled Seeker intent type: ${String(value)}`);
}
