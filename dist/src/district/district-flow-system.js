import { EmotionalTrend, ResonanceType } from '../runtime/resonance-types.js';
export var DistrictRhythmState;
(function (DistrictRhythmState) {
    DistrictRhythmState["Resting"] = "Resting";
    DistrictRhythmState["Waking"] = "Waking";
    DistrictRhythmState["Circulating"] = "Circulating";
    DistrictRhythmState["Strained"] = "Strained";
    DistrictRhythmState["Recovering"] = "Recovering";
})(DistrictRhythmState || (DistrictRhythmState = {}));
export var DistrictFlowKind;
(function (DistrictFlowKind) {
    DistrictFlowKind["Caravan"] = "Caravan";
    DistrictFlowKind["CitizenRoutine"] = "CitizenRoutine";
    DistrictFlowKind["ReconstructionCrew"] = "ReconstructionCrew";
    DistrictFlowKind["ArchiveTransfer"] = "ArchiveTransfer";
    DistrictFlowKind["RitualGathering"] = "RitualGathering";
})(DistrictFlowKind || (DistrictFlowKind = {}));
export class DistrictFlowSystem {
    circulate(input) {
        const flowRate = clamp01(input.routeStability * 0.35
            + input.district.environmentStability * 0.2
            + input.district.resonanceStability * 0.2
            + input.restorationActivity * 0.15
            - input.publicPressure * 0.1);
        return {
            districtId: input.district.districtId,
            rhythmState: rhythmFor(input, flowRate),
            flowRate,
            routeShouldReroute: input.routeStability < 0.45 || input.publicPressure > 0.65,
            resonanceType: input.restorationActivity >= input.publicPressure
                ? ResonanceType.Restoring
                : ResonanceType.Pressured,
            emotionalTrend: trendFor(input, flowRate),
        };
    }
}
function rhythmFor(input, flowRate) {
    if (input.publicPressure >= 0.75)
        return DistrictRhythmState.Strained;
    if (input.restorationActivity >= 0.6)
        return DistrictRhythmState.Recovering;
    if (flowRate >= 0.65)
        return DistrictRhythmState.Circulating;
    if (flowRate >= 0.35)
        return DistrictRhythmState.Waking;
    return DistrictRhythmState.Resting;
}
function trendFor(input, flowRate) {
    if (input.publicPressure >= 0.75)
        return EmotionalTrend.Distorting;
    if (input.restorationActivity >= 0.6)
        return EmotionalTrend.Recovering;
    if (flowRate >= 0.65)
        return EmotionalTrend.Synchronizing;
    if (input.memoryTraffic >= 0.45)
        return EmotionalTrend.Rising;
    return EmotionalTrend.Settling;
}
function clamp01(value) {
    if (Number.isNaN(value))
        return 0;
    return Math.max(0, Math.min(1, value));
}
