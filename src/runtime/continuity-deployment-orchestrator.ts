import { RuntimeValidationStatus } from './continuity-runtime-validation-system.js';
import { InfiniteSynchronizationStage } from '../civilization/infinite-continuation-synchronization-system.js';
import { AuditVisibilityLevel } from '../civilization/eternal-audit-visualization-system.js';

export enum DeploymentReadiness {
  Blocked = 'Blocked',
  InternalOnly = 'InternalOnly',
  PrototypeReady = 'PrototypeReady',
  PublicReady = 'PublicReady',
}

export interface ContinuityDeploymentInput {
  readonly deploymentId: string;
  readonly validationStatus: RuntimeValidationStatus;
  readonly synchronizationStage: InfiniteSynchronizationStage;
  readonly auditVisibilityLevel: AuditVisibilityLevel;
  readonly testCoverageScore: number;
  readonly openCriticalIssues: number;
}

export interface ContinuityDeploymentResult {
  readonly deploymentId: string;
  readonly readiness: DeploymentReadiness;
  readonly launchScore: number;
  readonly canDeploy: boolean;
  readonly requiresHumanReview: boolean;
}

export class ContinuityDeploymentOrchestrator {
  public evaluate(input: ContinuityDeploymentInput): ContinuityDeploymentResult {
    const launchScore = clamp01(
      validationStrength(input.validationStatus) * 0.35
        + synchronizationStrength(input.synchronizationStage) * 0.3
        + auditStrength(input.auditVisibilityLevel) * 0.2
        + input.testCoverageScore * 0.15
        - input.openCriticalIssues * 0.1,
    );

    return {
      deploymentId: input.deploymentId,
      readiness: readinessFor(input, launchScore),
      launchScore,
      canDeploy: launchScore >= 0.7 && input.openCriticalIssues === 0,
      requiresHumanReview: input.openCriticalIssues > 0 || launchScore < 0.85,
    };
  }
}

function readinessFor(input: ContinuityDeploymentInput, launchScore: number): DeploymentReadiness {
  if (input.openCriticalIssues > 0 || input.validationStatus === RuntimeValidationStatus.Invalid) {
    return DeploymentReadiness.Blocked;
  }

  if (launchScore >= 0.9) return DeploymentReadiness.PublicReady;
  if (launchScore >= 0.7) return DeploymentReadiness.PrototypeReady;
  return DeploymentReadiness.InternalOnly;
}

function validationStrength(status: RuntimeValidationStatus): number {
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

function synchronizationStrength(stage: InfiniteSynchronizationStage): number {
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

function auditStrength(level: AuditVisibilityLevel): number {
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

function clamp01(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

function exhaustiveValidationCheck(value: never): never {
  throw new Error(`Unhandled validation status: ${String(value)}`);
}

function exhaustiveSynchronizationCheck(value: never): never {
  throw new Error(`Unhandled synchronization stage: ${String(value)}`);
}

function exhaustiveAuditCheck(value: never): never {
  throw new Error(`Unhandled audit visibility level: ${String(value)}`);
}
