import type { WorldMemoryRecord } from '../runtime/continuity-event.js';
import { EventType, ResonanceType } from '../runtime/resonance-types.js';

export enum MythStage {
  Memory = 'Memory',
  RetoldStory = 'RetoldStory',
  Folktale = 'Folktale',
  Legend = 'Legend',
  Archetype = 'Archetype',
}

export interface CivilizationMythInput {
  readonly mythId: string;
  readonly currentStage: MythStage;
  readonly memories: WorldMemoryRecord[];
}

export interface CivilizationMythResult {
  readonly mythId: string;
  readonly nextStage: MythStage;
  readonly mythWeight: number;
  readonly dominantResonance: ResonanceType;
  readonly preservationNeeded: boolean;
}

export class CivilizationMythSystem {
  public evolve(input: CivilizationMythInput): CivilizationMythResult {
    const mythWeight = clamp01(
      input.memories.reduce((total, memory) => total + memory.historicalWeight, 0)
        / Math.max(1, input.memories.length),
    );

    const restorationWeight = weightFor(input.memories, EventType.RestorationApplied);
    const pressureWeight = weightFor(input.memories, EventType.PressureShift);

    return {
      mythId: input.mythId,
      nextStage: nextStage(input.currentStage, mythWeight),
      mythWeight,
      dominantResonance: restorationWeight >= pressureWeight
        ? ResonanceType.Restoring
        : ResonanceType.Pressured,
      preservationNeeded: mythWeight >= 0.7,
    };
  }
}

function nextStage(current: MythStage, mythWeight: number): MythStage {
  if (mythWeight < 0.3) return current;

  switch (current) {
    case MythStage.Memory:
      return MythStage.RetoldStory;
    case MythStage.RetoldStory:
      return MythStage.Folktale;
    case MythStage.Folktale:
      return MythStage.Legend;
    case MythStage.Legend:
      return MythStage.Archetype;
    case MythStage.Archetype:
      return MythStage.Archetype;
    default:
      return exhaustiveStageCheck(current);
  }
}

function weightFor(records: WorldMemoryRecord[], type: EventType): number {
  const matching = records.filter((record) => record.type === type);
  if (matching.length === 0) return 0;

  return clamp01(
    matching.reduce((total, record) => total + record.historicalWeight, 0)
      / matching.length,
  );
}

function clamp01(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

function exhaustiveStageCheck(value: never): never {
  throw new Error(`Unhandled myth stage: ${String(value)}`);
}
