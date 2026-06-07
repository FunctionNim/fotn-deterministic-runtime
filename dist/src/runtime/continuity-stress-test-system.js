import { RuntimeValidationStatus } from './continuity-runtime-validation-system.js';
import { InfiniteSynchronizationStage } from '../civilization/infinite-continuation-synchronization-system.js';
export var StressTestResultStatus;
(function (StressTestResultStatus) {
    StressTestResultStatus["Passed"] = "Passed";
    StressTestResultStatus["Strained"] = "Strained";
    StressTestResultStatus["DriftRisk"] = "DriftRisk";
    StressTestResultStatus["Failed"] = "Failed";
})(StressTestResultStatus || (StressTestResultStatus = {}));
export class ContinuityStressTestSystem {
    evaluate(input) {
        const pressureLoad = clamp01(input.simulatedSeekers / 10000
            + input.simulatedDistricts / 1000
            + input.eventVolume / 50000);
        const stabilityScore = clamp01(validationStrength(input.validationStatus) * 0.35
            + synchronizationStrength(input.synchronizationStage) * 0.35
            + (input.replayMatched ? 0.2 : 0)
            + (1 - pressureLoad) * 0.1);
        return {
            testId: input.testId,
            status: statusFor(stabilityScore, input.replayMatched),
            pressureLoad,
            stabilityScore,
            requiresOptimization: pressureLoad > 0.7 || stabilityScore < 0.75,
            requiresAudit: !input.replayMatched || input.validationStatus === RuntimeValidationStatus.DriftDetected,
        };
    }
}
function statusFor(stabilityScore, replayMatched) {
    if (!replayMatched)
        return StressTestResultStatus.DriftRisk;
    if (stabilityScore >= 0.85)
        return StressTestResultStatus.Passed;
    if (stabilityScore >= 0.65)
        return StressTestResultStatus.Strained;
    return StressTestResultStatus.Failed;
}
function validationStrength(status) {
    switch (status) {
        case RuntimeValidationStatus.Valid:
            return 1;
        case RuntimeValidationStatus.Warning:
            return 0.65;
        case RuntimeValidationStatus.DriftDetected:
            return 0.35;
        case RuntimeValidationStatus.Invalid:
            return 0;
        default:
            return exhaustiveValidationCheck(status);
    }
}
function synchronizationStrength(stage) {
    switch (stage) {
        case InfiniteSynchronizationStage.FragmentedContinuity:
            return 0.2;
        case InfiniteSynchronizationStage.RecoveringContinuity:
            return 0.45;
        case InfiniteSynchronizationStage.SynchronizedContinuity:
            return 0.7;
        case InfiniteSynchronizationStage.SelfHealingContinuity:
            return 0.85;
        case InfiniteSynchronizationStage.InfiniteContinuation:
            return 1;
        default:
            return exhaustiveSynchronizationCheck(stage);
    }
}
function clamp01(value) {
    if (Number.isNaN(value))
        return 0;
    return Math.max(0, Math.min(1, value));
}
function exhaustiveValidationCheck(value) {
    throw new Error(`Unhandled validation status: ${String(value)}`);
}
function exhaustiveSynchronizationCheck(value) {
    throw new Error(`Unhandled synchronization stage: ${String(value)}`);
}
