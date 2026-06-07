import { EncounterPhase } from '../runtime/resonance-types.js';
export var ContinuityInteractionState;
(function (ContinuityInteractionState) {
    ContinuityInteractionState["Observe"] = "Observe";
    ContinuityInteractionState["Approach"] = "Approach";
    ContinuityInteractionState["Commit"] = "Commit";
    ContinuityInteractionState["PressureResponse"] = "PressureResponse";
    ContinuityInteractionState["InterruptionCheck"] = "InterruptionCheck";
    ContinuityInteractionState["Resolution"] = "Resolution";
    ContinuityInteractionState["ExhaustionRecovery"] = "ExhaustionRecovery";
    ContinuityInteractionState["MemoryRecording"] = "MemoryRecording";
    ContinuityInteractionState["WorldContinues"] = "WorldContinues";
})(ContinuityInteractionState || (ContinuityInteractionState = {}));
export var ContinuityInteractionIntent;
(function (ContinuityInteractionIntent) {
    ContinuityInteractionIntent["Observe"] = "Observe";
    ContinuityInteractionIntent["Stabilize"] = "Stabilize";
    ContinuityInteractionIntent["Gather"] = "Gather";
    ContinuityInteractionIntent["Restore"] = "Restore";
    ContinuityInteractionIntent["Debate"] = "Debate";
    ContinuityInteractionIntent["Craft"] = "Craft";
    ContinuityInteractionIntent["Meditate"] = "Meditate";
    ContinuityInteractionIntent["Depart"] = "Depart";
})(ContinuityInteractionIntent || (ContinuityInteractionIntent = {}));
export class ContinuityInteractionSystem {
    execute(input) {
        const pressureDelta = clamp01(input.pressureChange - input.bondAssistStrength * 0.25);
        const exhaustionDelta = resolveExhaustionDelta(input, pressureDelta);
        const nextState = resolveNextState(input, pressureDelta, exhaustionDelta);
        return {
            nextState,
            encounterPhase: encounterPhaseFor(nextState),
            exhaustionDelta,
            pressureDelta,
            mentalismClarityDelta: -exhaustionDelta * 0.5,
            memoryShouldRecord: nextState === ContinuityInteractionState.MemoryRecording,
            worldShouldContinue: nextState === ContinuityInteractionState.WorldContinues,
        };
    }
}
function resolveNextState(input, pressureDelta, exhaustionDelta) {
    if (input.intent === ContinuityInteractionIntent.Depart) {
        return ContinuityInteractionState.WorldContinues;
    }
    if (input.intent === ContinuityInteractionIntent.Meditate) {
        return ContinuityInteractionState.ExhaustionRecovery;
    }
    if (!input.withinInteractionRange) {
        return ContinuityInteractionState.Approach;
    }
    if (input.seeker.exhaustionLevel + exhaustionDelta >= 1) {
        return ContinuityInteractionState.ExhaustionRecovery;
    }
    switch (input.currentState) {
        case ContinuityInteractionState.Observe:
            return input.intent === ContinuityInteractionIntent.Observe
                ? ContinuityInteractionState.Observe
                : ContinuityInteractionState.Approach;
        case ContinuityInteractionState.Approach:
            return ContinuityInteractionState.Commit;
        case ContinuityInteractionState.Commit:
            return pressureDelta > 0.45
                ? ContinuityInteractionState.PressureResponse
                : ContinuityInteractionState.Resolution;
        case ContinuityInteractionState.PressureResponse:
            return ContinuityInteractionState.InterruptionCheck;
        case ContinuityInteractionState.InterruptionCheck:
            return pressureDelta > 0.65
                ? ContinuityInteractionState.ExhaustionRecovery
                : ContinuityInteractionState.Resolution;
        case ContinuityInteractionState.Resolution:
            return ContinuityInteractionState.MemoryRecording;
        case ContinuityInteractionState.MemoryRecording:
            return ContinuityInteractionState.WorldContinues;
        case ContinuityInteractionState.ExhaustionRecovery:
            return ContinuityInteractionState.Observe;
        case ContinuityInteractionState.WorldContinues:
            return ContinuityInteractionState.Observe;
        default:
            return exhaustiveStateCheck(input.currentState);
    }
}
function resolveExhaustionDelta(input, pressureDelta) {
    if (input.intent === ContinuityInteractionIntent.Meditate) {
        return -0.35;
    }
    if (input.intent === ContinuityInteractionIntent.Observe) {
        return 0;
    }
    return clamp01(pressureDelta * 0.35);
}
function encounterPhaseFor(state) {
    switch (state) {
        case ContinuityInteractionState.Observe:
            return EncounterPhase.Dormant;
        case ContinuityInteractionState.Approach:
            return EncounterPhase.Entering;
        case ContinuityInteractionState.Commit:
        case ContinuityInteractionState.PressureResponse:
        case ContinuityInteractionState.InterruptionCheck:
            return EncounterPhase.Escalating;
        case ContinuityInteractionState.Resolution:
        case ContinuityInteractionState.MemoryRecording:
            return EncounterPhase.Stabilizing;
        case ContinuityInteractionState.ExhaustionRecovery:
        case ContinuityInteractionState.WorldContinues:
            return EncounterPhase.Resolved;
        default:
            return exhaustiveStateCheck(state);
    }
}
function clamp01(value) {
    if (Number.isNaN(value))
        return 0;
    return Math.max(0, Math.min(1, value));
}
function exhaustiveStateCheck(value) {
    throw new Error(`Unhandled continuity interaction state: ${String(value)}`);
}
