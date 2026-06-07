export var MentalismTier;
(function (MentalismTier) {
    MentalismTier["SurfaceContinuity"] = "SurfaceContinuity";
    MentalismTier["PatternRecognition"] = "PatternRecognition";
    MentalismTier["ContinuitySensitivity"] = "ContinuitySensitivity";
    MentalismTier["InterpretiveDepth"] = "InterpretiveDepth";
    MentalismTier["PressureAwareness"] = "PressureAwareness";
    MentalismTier["FullContinuityPerception"] = "FullContinuityPerception";
})(MentalismTier || (MentalismTier = {}));
export var ContinuityVisibilityLayer;
(function (ContinuityVisibilityLayer) {
    ContinuityVisibilityLayer["PublicRoute"] = "PublicRoute";
    ContinuityVisibilityLayer["PublicSymbol"] = "PublicSymbol";
    ContinuityVisibilityLayer["BasicPressure"] = "BasicPressure";
    ContinuityVisibilityLayer["AlternateRoute"] = "AlternateRoute";
    ContinuityVisibilityLayer["SocialPressure"] = "SocialPressure";
    ContinuityVisibilityLayer["HiddenFracture"] = "HiddenFracture";
    ContinuityVisibilityLayer["SymbolInstability"] = "SymbolInstability";
    ContinuityVisibilityLayer["ArchiveContradiction"] = "ArchiveContradiction";
    ContinuityVisibilityLayer["CascadePressure"] = "CascadePressure";
    ContinuityVisibilityLayer["HistoricalEcho"] = "HistoricalEcho";
})(ContinuityVisibilityLayer || (ContinuityVisibilityLayer = {}));
export class MentalismPerceptionSystem {
    evaluate(input) {
        const clarity = clamp01(input.baseMentalism
            + input.meditationAlignment * 0.25
            - input.seeker.exhaustionLevel * 0.45);
        const tier = tierFor(clarity);
        return {
            tier,
            clarity,
            visibleLayers: visibleLayersFor(tier),
            uiDepth: uiDepthFor(tier),
            sophiaAlertDepth: sophiaAlertDepthFor(tier),
        };
    }
}
function tierFor(clarity) {
    if (clarity >= 0.9)
        return MentalismTier.FullContinuityPerception;
    if (clarity >= 0.72)
        return MentalismTier.PressureAwareness;
    if (clarity >= 0.55)
        return MentalismTier.InterpretiveDepth;
    if (clarity >= 0.38)
        return MentalismTier.ContinuitySensitivity;
    if (clarity >= 0.2)
        return MentalismTier.PatternRecognition;
    return MentalismTier.SurfaceContinuity;
}
function visibleLayersFor(tier) {
    const layers = [
        ContinuityVisibilityLayer.PublicRoute,
        ContinuityVisibilityLayer.PublicSymbol,
        ContinuityVisibilityLayer.BasicPressure,
    ];
    if (tierAtLeast(tier, MentalismTier.PatternRecognition)) {
        layers.push(ContinuityVisibilityLayer.AlternateRoute, ContinuityVisibilityLayer.SocialPressure);
    }
    if (tierAtLeast(tier, MentalismTier.ContinuitySensitivity)) {
        layers.push(ContinuityVisibilityLayer.HiddenFracture, ContinuityVisibilityLayer.SymbolInstability);
    }
    if (tierAtLeast(tier, MentalismTier.InterpretiveDepth)) {
        layers.push(ContinuityVisibilityLayer.ArchiveContradiction);
    }
    if (tierAtLeast(tier, MentalismTier.PressureAwareness)) {
        layers.push(ContinuityVisibilityLayer.CascadePressure);
    }
    if (tierAtLeast(tier, MentalismTier.FullContinuityPerception)) {
        layers.push(ContinuityVisibilityLayer.HistoricalEcho);
    }
    return layers;
}
function uiDepthFor(tier) {
    switch (tier) {
        case MentalismTier.SurfaceContinuity:
            return 0.2;
        case MentalismTier.PatternRecognition:
            return 0.35;
        case MentalismTier.ContinuitySensitivity:
            return 0.5;
        case MentalismTier.InterpretiveDepth:
            return 0.65;
        case MentalismTier.PressureAwareness:
            return 0.8;
        case MentalismTier.FullContinuityPerception:
            return 1;
        default:
            return exhaustiveTierCheck(tier);
    }
}
function sophiaAlertDepthFor(tier) {
    switch (tier) {
        case MentalismTier.SurfaceContinuity:
            return 0.15;
        case MentalismTier.PatternRecognition:
            return 0.3;
        case MentalismTier.ContinuitySensitivity:
            return 0.45;
        case MentalismTier.InterpretiveDepth:
            return 0.6;
        case MentalismTier.PressureAwareness:
            return 0.75;
        case MentalismTier.FullContinuityPerception:
            return 0.9;
        default:
            return exhaustiveTierCheck(tier);
    }
}
function tierAtLeast(current, required) {
    return tierRank(current) >= tierRank(required);
}
function tierRank(tier) {
    switch (tier) {
        case MentalismTier.SurfaceContinuity:
            return 0;
        case MentalismTier.PatternRecognition:
            return 1;
        case MentalismTier.ContinuitySensitivity:
            return 2;
        case MentalismTier.InterpretiveDepth:
            return 3;
        case MentalismTier.PressureAwareness:
            return 4;
        case MentalismTier.FullContinuityPerception:
            return 5;
        default:
            return exhaustiveTierCheck(tier);
    }
}
function clamp01(value) {
    if (Number.isNaN(value))
        return 0;
    return Math.max(0, Math.min(1, value));
}
function exhaustiveTierCheck(value) {
    throw new Error(`Unhandled mentalism tier: ${String(value)}`);
}
