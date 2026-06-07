import { ResonanceType } from '../runtime/resonance-types.js';
export var SlotInteractionState;
(function (SlotInteractionState) {
    SlotInteractionState["Empty"] = "Empty";
    SlotInteractionState["Normal"] = "Normal";
    SlotInteractionState["Hover"] = "Hover";
    SlotInteractionState["Selected"] = "Selected";
    SlotInteractionState["Executing"] = "Executing";
    SlotInteractionState["Locked"] = "Locked";
    SlotInteractionState["Fractured"] = "Fractured";
    SlotInteractionState["Restoring"] = "Restoring";
})(SlotInteractionState || (SlotInteractionState = {}));
export var ComplexityViewMode;
(function (ComplexityViewMode) {
    ComplexityViewMode["Basic"] = "Basic";
    ComplexityViewMode["Advanced"] = "Advanced";
    ComplexityViewMode["Master"] = "Master";
})(ComplexityViewMode || (ComplexityViewMode = {}));
export function animationIntensityForResonance(resonanceState) {
    switch (resonanceState) {
        case ResonanceType.Stable:
            return 0.15;
        case ResonanceType.Pressured:
            return 0.65;
        case ResonanceType.Synchronized:
            return 0.35;
        case ResonanceType.Fractured:
            return 1;
        case ResonanceType.Restoring:
            return 0.25;
        default:
            return exhaustiveResonanceCheck(resonanceState);
    }
}
export function shouldShowLink(resonanceState, complexityViewMode) {
    if (complexityViewMode === ComplexityViewMode.Master)
        return true;
    if (complexityViewMode === ComplexityViewMode.Advanced) {
        return resonanceState !== ResonanceType.Stable;
    }
    return resonanceState === ResonanceType.Fractured
        || resonanceState === ResonanceType.Pressured;
}
function exhaustiveResonanceCheck(value) {
    throw new Error(`Unhandled resonance state: ${String(value)}`);
}
