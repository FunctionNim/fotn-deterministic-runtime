import { TelemetrySignalState } from './runtime-telemetry-aggregation-system.js';
import { RuntimeValidationStatus } from './continuity-runtime-validation-system.js';
import { StressTestResultStatus } from './continuity-stress-test-system.js';
export var OperationalRecoveryAction;
(function (OperationalRecoveryAction) {
    OperationalRecoveryAction["ContinueMonitoring"] = "ContinueMonitoring";
    OperationalRecoveryAction["OptimizeRuntime"] = "OptimizeRuntime";
    OperationalRecoveryAction["AuditReplay"] = "AuditReplay";
    OperationalRecoveryAction["RestoreContinuity"] = "RestoreContinuity";
    OperationalRecoveryAction["BlockDeployment"] = "BlockDeployment";
})(OperationalRecoveryAction || (OperationalRecoveryAction = {}));
export class OperationalRecoveryAutomationSystem {
    recover(input) {
        const recoveryPriority = clamp01(telemetryRisk(input.telemetryState) * 0.3
            + validationRisk(input.validationStatus) * 0.25
            + stressRisk(input.stressStatus) * 0.2
            + Math.min(1, input.replayMismatchCount / 10) * 0.15
            + Math.min(1, input.openCriticalIssues / 5) * 0.1);
        const action = chooseAction(input, recoveryPriority);
        return {
            recoveryId: input.recoveryId,
            action,
            shouldNotifySophia: recoveryPriority >= 0.35 || input.replayMismatchCount > 0,
            shouldBlockDeployment: action === OperationalRecoveryAction.BlockDeployment,
            recoveryPriority,
        };
    }
}
function chooseAction(input, recoveryPriority) {
    if (input.openCriticalIssues > 0 || input.validationStatus === RuntimeValidationStatus.Invalid) {
        return OperationalRecoveryAction.BlockDeployment;
    }
    if (input.replayMismatchCount > 0 || input.validationStatus === RuntimeValidationStatus.DriftDetected) {
        return OperationalRecoveryAction.AuditReplay;
    }
    if (input.stressStatus === StressTestResultStatus.Failed || recoveryPriority >= 0.75) {
        return OperationalRecoveryAction.RestoreContinuity;
    }
    if (input.telemetryState === TelemetrySignalState.AtRisk || input.stressStatus === StressTestResultStatus.Strained) {
        return OperationalRecoveryAction.OptimizeRuntime;
    }
    return OperationalRecoveryAction.ContinueMonitoring;
}
function telemetryRisk(state) {
    switch (state) {
        case TelemetrySignalState.Healthy:
            return 0;
        case TelemetrySignalState.Elevated:
            return 0.25;
        case TelemetrySignalState.AtRisk:
            return 0.65;
        case TelemetrySignalState.Critical:
            return 1;
        default:
            return exhaustiveTelemetryCheck(state);
    }
}
function validationRisk(status) {
    switch (status) {
        case RuntimeValidationStatus.Valid:
            return 0;
        case RuntimeValidationStatus.Warning:
            return 0.35;
        case RuntimeValidationStatus.DriftDetected:
            return 0.75;
        case RuntimeValidationStatus.Invalid:
            return 1;
        default:
            return exhaustiveValidationCheck(status);
    }
}
function stressRisk(status) {
    switch (status) {
        case StressTestResultStatus.Passed:
            return 0;
        case StressTestResultStatus.Strained:
            return 0.35;
        case StressTestResultStatus.DriftRisk:
            return 0.75;
        case StressTestResultStatus.Failed:
            return 1;
        default:
            return exhaustiveStressCheck(status);
    }
}
function clamp01(value) {
    if (Number.isNaN(value))
        return 0;
    return Math.max(0, Math.min(1, value));
}
function exhaustiveTelemetryCheck(value) {
    throw new Error(`Unhandled telemetry state: ${String(value)}`);
}
function exhaustiveValidationCheck(value) {
    throw new Error(`Unhandled validation status: ${String(value)}`);
}
function exhaustiveStressCheck(value) {
    throw new Error(`Unhandled stress status: ${String(value)}`);
}
