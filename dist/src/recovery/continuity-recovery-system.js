export var RecoveryActivity;
(function (RecoveryActivity) {
    RecoveryActivity["Meditate"] = "Meditate";
    RecoveryActivity["Rest"] = "Rest";
    RecoveryActivity["ObserveQuietly"] = "ObserveQuietly";
    RecoveryActivity["ReturnToPressure"] = "ReturnToPressure";
})(RecoveryActivity || (RecoveryActivity = {}));
export var RecoveryReadiness;
(function (RecoveryReadiness) {
    RecoveryReadiness["Exhausted"] = "Exhausted";
    RecoveryReadiness["Realigning"] = "Realigning";
    RecoveryReadiness["ClearEnough"] = "ClearEnough";
    RecoveryReadiness["Unavoidable"] = "Unavoidable";
})(RecoveryReadiness || (RecoveryReadiness = {}));
export class ContinuityRecoverySystem {
    recover(input) {
        const recoveryStrength = recoveryStrengthFor(input);
        const resultingExhaustion = clamp01(input.seeker.exhaustionLevel - recoveryStrength);
        const persistenceRecognized = input.witnessedReturnCount >= 3;
        return {
            seekerId: input.seeker.seekerId,
            readiness: readinessFor(resultingExhaustion, persistenceRecognized),
            exhaustionDelta: -recoveryStrength,
            mentalismClarityDelta: recoveryStrength * 0.6,
            canReturnToEncounter: resultingExhaustion <= 0.45,
            persistenceRecognized,
        };
    }
}
function recoveryStrengthFor(input) {
    switch (input.activity) {
        case RecoveryActivity.Meditate:
            return clamp01(0.25 + input.meditationFocus * 0.35);
        case RecoveryActivity.Rest:
            return 0.2;
        case RecoveryActivity.ObserveQuietly:
            return 0.12;
        case RecoveryActivity.ReturnToPressure:
            return 0;
        default:
            return exhaustiveActivityCheck(input.activity);
    }
}
function readinessFor(exhaustion, persistenceRecognized) {
    if (persistenceRecognized && exhaustion <= 0.35)
        return RecoveryReadiness.Unavoidable;
    if (exhaustion <= 0.35)
        return RecoveryReadiness.ClearEnough;
    if (exhaustion <= 0.75)
        return RecoveryReadiness.Realigning;
    return RecoveryReadiness.Exhausted;
}
function clamp01(value) {
    if (Number.isNaN(value))
        return 0;
    return Math.max(0, Math.min(1, value));
}
function exhaustiveActivityCheck(value) {
    throw new Error(`Unhandled recovery activity: ${String(value)}`);
}
