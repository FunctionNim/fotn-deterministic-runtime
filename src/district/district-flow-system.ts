import type { DistrictState } from '../runtime/continuity-state.js';
import { EmotionalTrend, ResonanceType } from '../runtime/resonance-types.js';

export enum DistrictRhythmState {
  Resting = 'Resting',
  Waking = 'Waking',
  Circulating = 'Circulating',
  Strained = 'Strained',
  Recovering = 'Recovering',
}

export enum DistrictFlowKind {
  Caravan = 'Caravan',
  CitizenRoutine = 'CitizenRoutine',
  ReconstructionCrew = 'ReconstructionCrew',
  ArchiveTransfer = 'ArchiveTransfer',
  RitualGathering = 'RitualGathering',
}

export interface DistrictFlowInput {
  readonly district: DistrictState;
  readonly flowKind: DistrictFlowKind;
  readonly routeStability: number;
  readonly publicPressure: number;
  readonly restorationActivity: number;
  readonly memoryTraffic: number;
}

export interface DistrictFlowResult {
  readonly districtId: string;
  readonly rhythmState: DistrictRhythmState;
  readonly flowRate: number;
  readonly routeShouldReroute: boolean;
  readonly resonanceType: ResonanceType;
  readonly emotionalTrend: EmotionalTrend;
}

export class DistrictFlowSystem {
  public circulate(input: DistrictFlowInput): DistrictFlowResult {
    const flowRate = clamp01(
      input.routeStability * 0.35
        + input.district.environmentStability * 0.2
        + input.district.resonanceStability * 0.2
        + input.restorationActivity * 0.15
        - input.publicPressure * 0.1,
    );

    return {
      districtId: input.district.districtId,
      rhythmState: rhythmFor(input, flowRate),
      flowRate,
      routeShouldReroute: input.routeStability < 0.45 || input.publicPressure > 0.65,
      resonanceType: input.restorationActivity >= input.publicPressure
        ? ResonanceType.Restoring
        : ResonanceType.Pressured,
      emotionalTrend: trendFor(input, flowRate),
    };
  }
}

function rhythmFor(input: DistrictFlowInput, flowRate: number): DistrictRhythmState {
  if (input.publicPressure >= 0.75) return DistrictRhythmState.Strained;
  if (input.restorationActivity >= 0.6) return DistrictRhythmState.Recovering;
  if (flowRate >= 0.65) return DistrictRhythmState.Circulating;
  if (flowRate >= 0.35) return DistrictRhythmState.Waking;
  return DistrictRhythmState.Resting;
}

function trendFor(input: DistrictFlowInput, flowRate: number): EmotionalTrend {
  if (input.publicPressure >= 0.75) return EmotionalTrend.Distorting;
  if (input.restorationActivity >= 0.6) return EmotionalTrend.Recovering;
  if (flowRate >= 0.65) return EmotionalTrend.Synchronizing;
  if (input.memoryTraffic >= 0.45) return EmotionalTrend.Rising;
  return EmotionalTrend.Settling;
}

function clamp01(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(1, value));
}
