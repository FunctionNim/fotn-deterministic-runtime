import { DeploymentReadiness } from './continuity-deployment-orchestrator.js';
import { DashboardHealthState } from './continuity-observability-dashboard.js';
import { RuntimeValidationStatus } from './continuity-runtime-validation-system.js';
export var PublicPrototypeReadinessState;
(function (PublicPrototypeReadinessState) {
    PublicPrototypeReadinessState["NotReady"] = "NotReady";
    PublicPrototypeReadinessState["InternalReview"] = "InternalReview";
    PublicPrototypeReadinessState["ClosedPrototype"] = "ClosedPrototype";
    PublicPrototypeReadinessState["PublicPrototype"] = "PublicPrototype";
})(PublicPrototypeReadinessState || (PublicPrototypeReadinessState = {}));
export class PublicPrototypeReadinessSystem {
    evaluate(input) {
        const missingRequirements = collectMissingRequirements(input);
        const readinessScore = clamp01(deploymentScore(input.deploymentReadiness) * 0.25
            + dashboardScore(input.dashboardHealth) * 0.2
            + validationScore(input.validationStatus) * 0.2
            + visibleLoopScore(input) * 0.35);
        return {
            prototypeId: input.prototypeId,
            readinessState: stateFor(readinessScore, missingRequirements),
            readinessScore,
            missingRequirements,
            canInviteFirstSeekers: readinessScore >= 0.85 && missingRequirements.length === 0,
        };
    }
}
function collectMissingRequirements(input) {
    const missing = [];
    if (!input.firstDistrictBoots)
        missing.push('first-district-boot');
    if (!input.functionBoxVisible)
        missing.push('contextual-function-box');
    if (!input.sophiaTypographyVisible)
        missing.push('sophia-typography');
    if (!input.restorationLoopComplete)
        missing.push('restoration-loop');
    return missing;
}
function visibleLoopScore(input) {
    const checks = [
        input.firstDistrictBoots,
        input.functionBoxVisible,
        input.sophiaTypographyVisible,
        input.restorationLoopComplete,
    ];
    return checks.filter(Boolean).length / checks.length;
}
function stateFor(readinessScore, missingRequirements) {
    if (readinessScore >= 0.9 && missingRequirements.length === 0) {
        return PublicPrototypeReadinessState.PublicPrototype;
    }
    if (readinessScore >= 0.75)
        return PublicPrototypeReadinessState.ClosedPrototype;
    if (readinessScore >= 0.5)
        return PublicPrototypeReadinessState.InternalReview;
    return PublicPrototypeReadinessState.NotReady;
}
function deploymentScore(readiness) {
    switch (readiness) {
        case DeploymentReadiness.PublicReady:
            return 1;
        case DeploymentReadiness.PrototypeReady:
            return 0.8;
        case DeploymentReadiness.InternalOnly:
            return 0.45;
        case DeploymentReadiness.Blocked:
            return 0;
        default:
            return exhaustiveDeploymentCheck(readiness);
    }
}
function dashboardScore(state) {
    switch (state) {
        case DashboardHealthState.LaunchReady:
            return 1;
        case DashboardHealthState.Stable:
            return 0.8;
        case DashboardHealthState.Watch:
            return 0.45;
        case DashboardHealthState.Critical:
            return 0;
        default:
            return exhaustiveDashboardCheck(state);
    }
}
function validationScore(status) {
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
function clamp01(value) {
    if (Number.isNaN(value))
        return 0;
    return Math.max(0, Math.min(1, value));
}
function exhaustiveDeploymentCheck(value) {
    throw new Error(`Unhandled deployment readiness: ${String(value)}`);
}
function exhaustiveDashboardCheck(value) {
    throw new Error(`Unhandled dashboard health state: ${String(value)}`);
}
function exhaustiveValidationCheck(value) {
    throw new Error(`Unhandled validation status: ${String(value)}`);
}
