import { EventType, ResonanceType } from '../runtime/resonance-types.js';
import type { WorldMemoryRecord } from '../runtime/continuity-event.js';

export enum SymbolEvolutionStage {
  NewMark = 'NewMark',
  RememberedSign = 'RememberedSign',
  DistrictSymbol = 'DistrictSymbol',
  CulturalSeal = 'CulturalSeal',
  LivingMeaning = 'LivingMeaning',
}

export interface SymbolicMemoryInput {
  readonly symbolId: string;
  readonly currentStage: SymbolEvolutionStage;
  readonly memories: WorldMemoryRecord[];
}

export interface SymbolicEvolutionResult {
  readonly symbolId: string;
  readonly nextStage: SymbolEvolutionStage;
  readonly emotionalWeight: number;
  readonly resonanceType: ResonanceType;
}

export class SymbolicEvolutionSystem {
  public evolve(input: SymbolicMemoryInput): SymbolicEvolutionResult {
    const emotionalWeight = clamp01(
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
      symbolId: input.symbolId,
      nextStage: nextStage(input.currentStage, emotionalWeight),
      emotionalWeight,
      resonanceType: restorationCount >= pressureCount
        ? ResonanceType.Restoring
        : ResonanceType.Pressured,
    };
  }
}

function nextStage(
  current: SymbolEvolutionStage,
  emotionalWeight: number,
): SymbolEvolutionStage {
  if (emotionalWeight < 0.35) return current;

  switch (current) {
    case SymbolEvolutionStage.NewMark:
      return SymbolEvolutionStage.RememberedSign;
    case SymbolEvolutionStage.RememberedSign:
      return SymbolEvolutionStage.DistrictSymbol;
    case SymbolEvolutionStage.DistrictSymbol:
      return SymbolEvolutionStage.CulturalSeal;
    case SymbolEvolutionStage.CulturalSeal:
      return SymbolEvolutionStage.LivingMeaning;
    case SymbolEvolutionStage.LivingMeaning:
      return SymbolEvolutionStage.LivingMeaning;
    default:
      return exhaustiveStageCheck(current);
  }
}

function clamp01(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

function exhaustiveStageCheck(value: never): never {
  throw new Error(`Unhandled symbol evolution stage: ${String(value)}`);
}
