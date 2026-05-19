import { RuntimeValidationStatus } from './continuity-runtime-validation-system.js';
import { StressTestResultStatus } from './continuity-stress-test-system.js';
import { DashboardHealthState } from './continuity-observability-dashboard.js';

export enum TelemetrySignalState {
  Healthy = 'Healthy',
  Elevated = 'Elevated',
  AtRisk = 'AtRisk',
  Critical = 'Critical',
}

export interface RuntimeTelemetryAggregationInput {
  readonly telemetryId: string;
  readonly validationStatus: RuntimeValidationStatus;
  readonly stressStatus: StressTestResultStatus;
  readonly dashboardHealth: DashboardHealthState;
  readonly averageTickMs: number;
  readonly eventQueueDepth: number;
  readonly replayMismatchCount: number;
}

export interface RuntimeTelemetryAggregationResult {
  readonly telemetryId: string;
  readonly signalState: TelemetrySignalState;
  readonly performanceScore: number;
  readonly continuityRiskScore: number;
  readonly notifySophia: boolean;
  readonly requiresOptimization: boolean;
}

export class RuntimeTelemetryAggregationSystem {
  public aggregate(
    input: RuntimeTelemetryAggregationInput,
  ): RuntimeTelemetryAggregationResult {
    const performanceScore = clamp01(
      1 - input.averageTickMs / 33
        - input.eventQueueDepth / 100000,
    );

    const continuityRiskScore = clamp01(
      validationRisk(input.validationStatus) * 0.35
        + stressRisk(input.stressStatus) * 0.3
        + dashboardRisk(input.dashboardHealth) * 0.25
        + Math.min(1, input.replayMismatchCount / 10) * 0.1,
    );

    return {
      telemetryId: input.telemetryId,
      signalState: signalStateFor(performanceScore, continuityRiskScore),
      performanceScore,
      continuityRiskScore,
      notifySophia: continuityRiskScore >= 0.45 || input.replayMismatchCount > 0,
      requiresOptimization: performanceScore < 0.7 || input.eventQueueDepth > 50000,
    };
  }
}

function signalStateFor(
  performanceScore: number,
  riskScore: number,
): TelemetrySignalState {
  if (riskScore >= 0.75 || performanceScore < 0.4) return TelemetrySignalState.Critical;
  if (riskScore >= 0.5 || performanceScore < 0.65) return TelemetrySignalState.AtRisk;
  if (riskScore >= 0.25 || performanceScore < 0.8) return TelemetrySignalState.Elevated;
  return TelemetrySignalState.Healthy;
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

function dashboardRisk(state: DashboardHealthState): number {
  switch (state) {
    case DashboardHealthState.LaunchReady:
      return 0;
    case DashboardHealthState.Stable:
      return 0.1;
    case DashboardHealthState.Watch:
      return 0.45;
    case DashboardHealthState.Critical:
      return 1;
    default:
      return exhaustiveDashboardCheck(state);
  }
}

function clamp01(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

function exhaustiveValidationCheck(value: never): never {
  throw new Error(`Unhandled validation status: ${String(value)}`);
}

function exhaustiveStressCheck(value: never): never {
  throw new Error(`Unhandled stress status: ${String(value)}`);
}

function exhaustiveDashboardCheck(value: never): never {
  throw new Error(`Unhandled dashboard health state: ${String(value)}`);
}
