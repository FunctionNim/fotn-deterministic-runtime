import { ResonanceType } from '../runtime/resonance-types.js';
export var SymbolEvolutionState;
(function (SymbolEvolutionState) {
    SymbolEvolutionState["StableMark"] = "StableMark";
    SymbolEvolutionState["ContestedMeaning"] = "ContestedMeaning";
    SymbolEvolutionState["RewrittenMark"] = "RewrittenMark";
    SymbolEvolutionState["ScarredSymbol"] = "ScarredSymbol";
    SymbolEvolutionState["InheritedMeaning"] = "InheritedMeaning";
})(SymbolEvolutionState || (SymbolEvolutionState = {}));
export var SymbolPressureSource;
(function (SymbolPressureSource) {
    SymbolPressureSource["Ritual"] = "Ritual";
    SymbolPressureSource["Debate"] = "Debate";
    SymbolPressureSource["Reconstruction"] = "Reconstruction";
    SymbolPressureSource["Confrontation"] = "Confrontation";
    SymbolPressureSource["MemoryDrift"] = "MemoryDrift";
})(SymbolPressureSource || (SymbolPressureSource = {}));
export class SymbolEvolutionSystem {
    evolve(input) {
        const inheritanceStrength = clamp01(input.historicalWeight * 0.4
            + input.publicAlignment * 0.25
            + input.restorationInfluence * 0.2
            - input.contradictionPressure * 0.15);
        return {
            symbolId: input.symbolId,
            districtId: input.districtId,
            nextState: nextStateFor(input, inheritanceStrength),
            resonanceType: input.restorationInfluence >= input.contradictionPressure
                ? ResonanceType.Restoring
                : ResonanceType.Pressured,
            visibleRewrite: input.publicAlignment >= 0.45 || input.contradictionPressure >= 0.45,
            shouldPropagate: inheritanceStrength >= 0.5,
            inheritanceStrength,
        };
    }
}
function nextStateFor(input, inheritanceStrength) {
    if (input.contradictionPressure >= 0.75)
        return SymbolEvolutionState.ScarredSymbol;
    if (input.publicAlignment >= 0.65 && input.restorationInfluence >= 0.45) {
        return SymbolEvolutionState.RewrittenMark;
    }
    if (inheritanceStrength >= 0.75)
        return SymbolEvolutionState.InheritedMeaning;
    if (input.contradictionPressure >= 0.35)
        return SymbolEvolutionState.ContestedMeaning;
    return input.currentState;
}
function clamp01(value) {
    if (Number.isNaN(value))
        return 0;
    return Math.max(0, Math.min(1, value));
}
