import { EventType, ResonanceType } from '../runtime/resonance-types.js';
import type { WorldMemoryRecord } from '../runtime/continuity-event.js';

export enum ContinuationAnchorType {
  MemoryVault = 'MemoryVault',
  RestorationTradition = 'RestorationTradition',
  SymbolicShrine = 'SymbolicShrine',
  EmotionalBond = 'EmotionalBond',
  ResonanceSanctuary = 'ResonanceSanctuary',
}

export interface ContinuationAnchorInput {
  readonly anchorId: string;
  readonly type: ContinuationAnchorType;
  readonly districtId: string;
  readonly memories: WorldMemoryRecord[];
}

export interface ContinuationAnchorResult {
  readonly anchorId: string;
  readonly type: ContinuationAnchorType;
  readonly districtId: string;
  readonly preservationStrength: number;
  readonly survivesCollapse: boolean;
  readonly resonanceType: ResonanceType;
}

export class ContinuationAnchorSystem {
  public evaluate(input: ContinuationAnchorInput): ContinuationAnchorResult {
    const preservationStrength = clamp01(
      input.memories.reduce((total, memory) => total + memory.historicalWeight, 0)
        / Math.max(1, input.memories.length),
    );

    const restorationCount = input.memories.filter(
      (memory) => memory.type === EventType.RestorationApplied,
    ).length;

    const pressureCount = input.memories.filter(
      (memory) => memory.type === EventType.PressureShift,
    ).length;

    return {
      anchorId: input.anchorId,
      type: input.type,
      districtId: input.districtId,
      preservationStrength,
      survivesCollapse: preservationStrength >= 0.6,
      resonanceType: restorationCount >= pressureCount
        ? ResonanceType.Restoring
        : ResonanceType.Pressured,
    };
  }
}

function clamp01(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(1, value));
}
