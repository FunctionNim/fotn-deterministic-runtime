import { DeploymentReadiness } from './continuity-deployment-orchestrator.js';
import { RuntimeValidationStatus } from './continuity-runtime-validation-system.js';
import { InfiniteSynchronizationStage } from '../civilization/infinite-continuation-synchronization-system.js';
import { AuditVisibilityLevel } from '../civilization/eternal-audit-visualization-system.js';

export enum DashboardHealthState {
  Critical = 'Critical',
  Watch = 'Watch',
  Stable = 'Stable',
  LaunchReady = 'LaunchReady',
}

export interface ContinuityObservabilityDashboardInput {
  readonly dashboardId: string;
  readonly readiness: DeploymentReadiness;
  readonly validationStatus: RuntimeValidationStatus;
  readonly synchronizationStage: InfiniteSynchronizationStage;
  readonly auditVisibilityLevel: AuditVisibilityLevel;
  readonly launchScore: number;
  readonly openCriticalIssues: number;
}

export interface ContinuityObservabilityDashboardResult {
  readonly dashboardId: string;
  readonly healthState: DashboardHealthState;
  readonly shouldNotifySophia: boolean;
  readonly shouldBlockDeployment: boolean;
  readonly summary: string;
}

export class ContinuityObservabilityDashboard {
  public evaluate(
    input: ContinuityObservabilityDashboardInput,
  ): ContinuityObservabilityDashboardResult {
    const shouldBlockDeployment = input.readiness === DeploymentReadiness.Blocked
      || input.validationStatus === RuntimeValidationStatus.Invalid
      || input.openCriticalIssues > 0;

    const healthState = resolveHealthState(input, shouldBlockDeployment);

    return {
      dashboardId: input.dashboardId,
      healthState,
      shouldNotifySophia: shouldBlockDeployment
        || input.validationStatus === RuntimeValidationStatus.DriftDetected
        || input.launchScore < 0.7,
      shouldBlockDeployment,
      summary: buildSummary(input, healthState),
    };
  }
}

function resolveHealthState(
  input: ContinuityObservabilityDashboardInput,
  shouldBlockDeployment: boolean,
): DashboardHealthState {
  if (shouldBlockDeployment) return DashboardHealthState.Critical;

  if (input.readiness === DeploymentReadiness.PublicReady
    && input.launchScore >= 0.9
    && input.synchronizationStage === InfiniteSynchronizationStage.InfiniteContinuation) {
    return DashboardHealthState.LaunchReady;
  }

  if (input.validationStatus === RuntimeValidationStatus.Valid
    && input.auditVisibilityLevel !== AuditVisibilityLevel.Hidden) {
    return DashboardHealthState.Stable;
  }

  return DashboardHealthState.Watch;
}

function buildSummary(
  input: ContinuityObservabilityDashboardInput,
  healthState: DashboardHealthState,
): string {
  return [
    `Health=${healthState}`,
    `Readiness=${input.readiness}`,
    `Validation=${input.validationStatus}`,
    `Synchronization=${input.synchronizationStage}`,
    `Audit=${input.auditVisibilityLevel}`,
    `LaunchScore=${input.launchScore.toFixed(2)}`,
    `CriticalIssues=${input.openCriticalIssues}`,
  ].join(';');
}
