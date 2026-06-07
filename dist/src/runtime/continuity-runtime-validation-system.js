export var RuntimeValidationStatus;
(function (RuntimeValidationStatus) {
    RuntimeValidationStatus["Valid"] = "Valid";
    RuntimeValidationStatus["Warning"] = "Warning";
    RuntimeValidationStatus["DriftDetected"] = "DriftDetected";
    RuntimeValidationStatus["Invalid"] = "Invalid";
})(RuntimeValidationStatus || (RuntimeValidationStatus = {}));
export class ContinuityRuntimeValidationSystem {
    validate(input) {
        const signatureMatched = input.expectedSignature === input.actualSignature;
        const coherenceScore = clamp01(input.synchronizationStrength * 0.5
            + (signatureMatched ? 0.25 : 0)
            + (input.replayMatched ? 0.25 : 0));
        return {
            validationId: input.validationId,
            status: statusFor(coherenceScore, signatureMatched, input.replayMatched),
            coherenceScore,
            requiresRepair: coherenceScore < 0.6 || !signatureMatched,
            requiresAudit: input.auditRequired || !input.replayMatched || !signatureMatched,
        };
    }
}
function statusFor(coherenceScore, signatureMatched, replayMatched) {
    if (!signatureMatched)
        return RuntimeValidationStatus.DriftDetected;
    if (!replayMatched)
        return RuntimeValidationStatus.Warning;
    if (coherenceScore >= 0.85)
        return RuntimeValidationStatus.Valid;
    if (coherenceScore >= 0.6)
        return RuntimeValidationStatus.Warning;
    return RuntimeValidationStatus.Invalid;
}
function clamp01(value) {
    if (Number.isNaN(value))
        return 0;
    return Math.max(0, Math.min(1, value));
}
