import { EventType, ResonanceType } from '../runtime/resonance-types.js';
export var ContinuationAnchorType;
(function (ContinuationAnchorType) {
    ContinuationAnchorType["MemoryVault"] = "MemoryVault";
    ContinuationAnchorType["RestorationTradition"] = "RestorationTradition";
    ContinuationAnchorType["SymbolicShrine"] = "SymbolicShrine";
    ContinuationAnchorType["EmotionalBond"] = "EmotionalBond";
    ContinuationAnchorType["ResonanceSanctuary"] = "ResonanceSanctuary";
})(ContinuationAnchorType || (ContinuationAnchorType = {}));
export class ContinuationAnchorSystem {
    evaluate(input) {
        const preservationStrength = clamp01(input.memories.reduce((total, memory) => total + memory.historicalWeight, 0)
            / Math.max(1, input.memories.length));
        const restorationCount = input.memories.filter((memory) => memory.type === EventType.RestorationApplied).length;
        const pressureCount = input.memories.filter((memory) => memory.type === EventType.PressureShift).length;
        return {
            anchorId: input.anchorId,
            type: input.type,
            districtId: input.districtId,
            preservationStrength,
            survivesCollapse: preservationStrength >= 0.6,
            resonanceType: restorationCount >= pressureCount
                ? ResonanceType.Restoring
                : ResonanceType.Pressured,
        };
    }
}
function clamp01(value) {
    if (Number.isNaN(value))
        return 0;
    return Math.max(0, Math.min(1, value));
}
