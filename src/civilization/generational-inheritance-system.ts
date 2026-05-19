import type { WorldMemoryRecord } from '../runtime/continuity-event.js';
import { EventType, ResonanceType } from '../runtime/resonance-types.js';

export interface GenerationalInheritanceInput {
  readonly generationId: string;
  readonly parentGenerationId?: string;
  readonly inheritedMemories: WorldMemoryRecord[];
}

export interface GenerationalInheritanceResult {
  readonly generationId: string;
  readonly parentGenerationId?: string;
  readonly inheritedRecords: WorldMemoryRecord[];
  readonly restorationInheritance: number;
  readonly pressureInheritance: number;
  readonly dominantResonance: ResonanceType;
}

export class GenerationalInheritanceSystem {
  public inherit(input: GenerationalInheritanceInput): GenerationalInheritanceResult {
    const inheritedRecords = input.inheritedMemories
      .filter((memory) => memory.historicalWeight >= 0.35)
      .map((memory) => ({
        ...memory,
        recordId: `${memory.recordId}:generation:${input.generationId}`,
        historicalWeight: Math.max(0, memory.historicalWeight - 0.1),
      }));

    const restorationInheritance = weightFor(
      inheritedRecords,
      EventType.RestorationApplied,
    );

    const pressureInheritance = weightFor(
      inheritedRecords,
      EventType.PressureShift,
    );

    return {
      generationId: input.generationId,
      parentGenerationId: input.parentGenerationId,
      inheritedRecords,
      restorationInheritance,
      pressureInheritance,
      dominantResonance: restorationInheritance >= pressureInheritance
        ? ResonanceType.Restoring
        : ResonanceType.Pressured,
    };
  }
}

function weightFor(records: WorldMemoryRecord[], type: EventType): number {
  const matching = records.filter((record) => record.type === type);
  if (matching.length === 0) return 0;

  return matching.reduce((total, record) => total + record.historicalWeight, 0)
    / matching.length;
}
