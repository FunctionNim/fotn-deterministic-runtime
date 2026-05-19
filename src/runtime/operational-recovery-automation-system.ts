import { TelemetrySignalState } from './runtime-telemetry-aggregation-system.js';
import { RuntimeValidationStatus } from './continuity-runtime-validation-system.js';
import { StressTestResultStatus } from './continuity-stress-test-system.js';

export enum OperationalRecoveryAction {
  ContinueMonitoring = 'ContinueMonitoring',
  OptimizeRuntime = 'OptimizeRuntime',
  AuditReplay = 'AuditReplay',
  RestoreContinuity = 'RestoreContinuity',
  BlockDeployment = 'BlockDeployment',
}

export interface OperationalRecoveryAutomationInput {
  readonly recoveryId: string;
  readonly telemetryState: TelemetrySignalState;
  readonly validationStatus: RuntimeValidationStatus;
  readonly stressStatus: StressTestResultStatus;
  readonly replayMismatchCount: number;
  readonly openCriticalIssues: number;
}

export interface OperationalRecoveryAutomationResult {
  readonly recoveryId: string;
  readonly action: OperationalRecoveryAction;
  readonly shouldNotifySophia: boolean;
  readonly shouldBlockDeployment: boolean;
  readonly recoveryPriority: number;
}

export class OperationalRecoveryAutomationSystem {
  public recover(input: OperationalRecoveryAutomationInput): OperationalRecoveryAutomationResult {
    const recoveryPriority = clamp01(
      telemetryRisk(input.telemetryState) * 0.3
        + validationRisk(input.validationStatus) * 0.25
        + stressRisk(input.stressStatus) * 0.2
        + Math.min(1, input.replayMismatchCount / 10) * 0.15
        + Math.min(1, input.openCriticalIssues / 5) * 0.1,
    );

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

function chooseAction(
  input: OperationalRecoveryAutomationInput,
  recoveryPriority: number,
): OperationalRecoveryAction {
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

function telemetryRisk(state: TelemetrySignalState): number {
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

function validationRisk(status: RuntimeValidationStatus): number {
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

function stressRisk(status: StressTestResultStatus): number {
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

function clamp01(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

function exhaustiveTelemetryCheck(value: never): never {
  throw new Error(`Unhandled telemetry state: ${String(value)}`);
}

function exhaustiveValidationCheck(value: never): never {
  throw new Error(`Unhandled validation status: ${String(value)}`);
}

function exhaustiveStressCheck(value: never): never {
  throw new Error(`Unhandled stress status: ${String(value)}`);
}
