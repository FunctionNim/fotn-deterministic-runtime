import type { WorldMemoryRecord } from '../runtime/continuity-event.js';
import { EventType, ResonanceType } from '../runtime/resonance-types.js';

export enum RestorationLegacyStage {
  FreshRestoration = 'FreshRestoration',
  RememberedCare = 'RememberedCare',
  DistrictPractice = 'DistrictPractice',
  CulturalTradition = 'CulturalTradition',
  ContinuityAnchor = 'ContinuityAnchor',
}

export interface RestorationLegacyInput {
  readonly districtId: string;
  readonly currentStage: RestorationLegacyStage;
  readonly restorationMemories: WorldMemoryRecord[];
}

export interface RestorationLegacyResult {
  readonly districtId: string;
  readonly nextStage: RestorationLegacyStage;
  readonly resilience: number;
  readonly memoryWeight: number;
  readonly resonanceType: ResonanceType;
}

export class RestorationLegacySystem {
  public evolve(input: RestorationLegacyInput): RestorationLegacyResult {
    const restorationRecords = input.restorationMemories.filter(
      (memory) => memory.type === EventType.RestorationApplied,
    );

    const memoryWeight = clamp01(
      restorationRecords.reduce((total, memory) => total + memory.historicalWeight, 0)
        / Math.max(1, restorationRecords.length),
    );

    const resilience = clamp01(
      memoryWeight + restorationRecords.length * 0.05,
    );

    return {
      districtId: input.districtId,
      nextStage: nextStage(input.currentStage, resilience),
      resilience,
      memoryWeight,
      resonanceType: ResonanceType.Restoring,
    };
  }
}

function nextStage(
  current: RestorationLegacyStage,
  resilience: number,
): RestorationLegacyStage {
  if (resilience < 0.35) return current;

  switch (current) {
    case RestorationLegacyStage.FreshRestoration:
      return RestorationLegacyStage.RememberedCare;
    case RestorationLegacyStage.RememberedCare:
      return RestorationLegacyStage.DistrictPractice;
    case RestorationLegacyStage.DistrictPractice:
      return RestorationLegacyStage.CulturalTradition;
    case RestorationLegacyStage.CulturalTradition:
      return RestorationLegacyStage.ContinuityAnchor;
    case RestorationLegacyStage.ContinuityAnchor:
      return RestorationLegacyStage.ContinuityAnchor;
    default:
      return exhaustiveStageCheck(current);
  }
}

function clamp01(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

function exhaustiveStageCheck(value: never): never {
  throw new Error(`Unhandled restoration legacy stage: ${String(value)}`);
}
