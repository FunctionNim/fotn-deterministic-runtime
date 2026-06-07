import { RuntimeValidationStatus } from './continuity-runtime-validation-system.js';
import { InfiniteSynchronizationStage } from '../civilization/infinite-continuation-synchronization-system.js';
import { AuditVisibilityLevel } from '../civilization/eternal-audit-visualization-system.js';
export var DeploymentReadiness;
(function (DeploymentReadiness) {
    DeploymentReadiness["Blocked"] = "Blocked";
    DeploymentReadiness["InternalOnly"] = "InternalOnly";
    DeploymentReadiness["PrototypeReady"] = "PrototypeReady";
    DeploymentReadiness["PublicReady"] = "PublicReady";
})(DeploymentReadiness || (DeploymentReadiness = {}));
export class ContinuityDeploymentOrchestrator {
    evaluate(input) {
        const launchScore = clamp01(validationStrength(input.validationStatus) * 0.35
            + synchronizationStrength(input.synchronizationStage) * 0.3
            + auditStrength(input.auditVisibilityLevel) * 0.2
            + input.testCoverageScore * 0.15
            - input.openCriticalIssues * 0.1);
        return {
            deploymentId: input.deploymentId,
            readiness: readinessFor(input, launchScore),
            launchScore,
            canDeploy: launchScore >= 0.7 && input.openCriticalIssues === 0,
            requiresHumanReview: input.openCriticalIssues > 0 || launchScore < 0.85,
        };
    }
}
function readinessFor(input, launchScore) {
    if (input.openCriticalIssues > 0 || input.validationStatus === RuntimeValidationStatus.Invalid) {
        return DeploymentReadiness.Blocked;
    }
    if (launchScore >= 0.9)
        return DeploymentReadiness.PublicReady;
    if (launchScore >= 0.7)
        return DeploymentReadiness.PrototypeReady;
    return DeploymentReadiness.InternalOnly;
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
function auditStrength(level) {
    switch (level) {
        case AuditVisibilityLevel.Hidden:
            return 0;
        case AuditVisibilityLevel.Summary:
            return 0.35;
        case AuditVisibilityLevel.Detailed:
            return 0.65;
        case AuditVisibilityLevel.Recursive:
            return 0.85;
        case AuditVisibilityLevel.Eternal:
            return 1;
        default:
            return exhaustiveAuditCheck(level);
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
function exhaustiveAuditCheck(value) {
    throw new Error(`Unhandled audit visibility level: ${String(value)}`);
}
