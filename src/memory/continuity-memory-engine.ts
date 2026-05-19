import type { MemoryInfluence } from '../runtime/continuity-state.js';
import type { WorldMemoryRecord } from '../runtime/continuity-event.js';
import { EventType, ResonanceType } from '../runtime/resonance-types.js';

export enum MemoryPersistenceStage {
  FreshRecord = 'FreshRecord',
  WitnessedMemory = 'WitnessedMemory',
  PublicInterpretation = 'PublicInterpretation',
  HistoricalPressure = 'HistoricalPressure',
  LivingContinuity = 'LivingContinuity',
}

export interface ContinuityMemoryEngineInput {
  readonly memoryId: string;
  readonly sourceEventType: EventType;
  readonly districtId: string;
  readonly witnessCount: number;
  readonly pressureWeight: number;
  readonly restorationWeight: number;
  readonly priorInfluences: MemoryInfluence[];
}

export interface ContinuityMemoryEngineResult {
  readonly memoryRecord: WorldMemoryRecord;
  readonly stage: MemoryPersistenceStage;
  readonly distorted: boolean;
  readonly contradictionPressure: number;
  readonly shouldPropagate: boolean;
}

export class ContinuityMemoryEngine {
  public preserve(input: ContinuityMemoryEngineInput): ContinuityMemoryEngineResult {
    const contradictionPressure = clamp01(
      input.priorInfluences.filter((influence) => influence.distorted).length * 0.12
        + input.pressureWeight * 0.45
        - input.restorationWeight * 0.25,
    );

    const historicalWeight = clamp01(
      input.witnessCount / 10
        + input.pressureWeight * 0.35
        + input.restorationWeight * 0.35
        + input.priorInfluences.length * 0.03,
    );

    const resonanceType = input.restorationWeight >= input.pressureWeight
      ? ResonanceType.Restoring
      : ResonanceType.Pressured;

    const memoryRecord: WorldMemoryRecord = {
      recordId: input.memoryId,
      type: input.sourceEventType,
      historicalWeight,
      influencedDistricts: [input.districtId],
      emotionalResonance: {
        emotionalWeight: historicalWeight,
        resonanceType,
      },
    };

    return {
      memoryRecord,
      stage: stageFor(historicalWeight, contradictionPressure),
      distorted: contradictionPressure >= 0.55,
      contradictionPressure,
      shouldPropagate: historicalWeight >= 0.45,
    };
  }
}

function stageFor(
  historicalWeight: number,
  contradictionPressure: number,
): MemoryPersistenceStage {
  if (historicalWeight >= 0.85 && contradictionPressure < 0.35) {
    return MemoryPersistenceStage.LivingContinuity;
  }

  if (historicalWeight >= 0.7) return MemoryPersistenceStage.HistoricalPressure;
  if (historicalWeight >= 0.5) return MemoryPersistenceStage.PublicInterpretation;
  if (historicalWeight >= 0.25) return MemoryPersistenceStage.WitnessedMemory;
  return MemoryPersistenceStage.FreshRecord;
}

function clamp01(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(1, value));
}
