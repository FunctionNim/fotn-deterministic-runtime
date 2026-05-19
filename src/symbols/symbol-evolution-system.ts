import { EventType, ResonanceType } from '../runtime/resonance-types.js';

export enum SymbolEvolutionState {
  StableMark = 'StableMark',
  ContestedMeaning = 'ContestedMeaning',
  RewrittenMark = 'RewrittenMark',
  ScarredSymbol = 'ScarredSymbol',
  InheritedMeaning = 'InheritedMeaning',
}

export enum SymbolPressureSource {
  Ritual = 'Ritual',
  Debate = 'Debate',
  Reconstruction = 'Reconstruction',
  Confrontation = 'Confrontation',
  MemoryDrift = 'MemoryDrift',
}

export interface SymbolEvolutionInput {
  readonly symbolId: string;
  readonly districtId: string;
  readonly currentState: SymbolEvolutionState;
  readonly pressureSource: SymbolPressureSource;
  readonly eventType: EventType;
  readonly publicAlignment: number;
  readonly contradictionPressure: number;
  readonly restorationInfluence: number;
  readonly historicalWeight: number;
}

export interface SymbolEvolutionResult {
  readonly symbolId: string;
  readonly districtId: string;
  readonly nextState: SymbolEvolutionState;
  readonly resonanceType: ResonanceType;
  readonly visibleRewrite: boolean;
  readonly shouldPropagate: boolean;
  readonly inheritanceStrength: number;
}

export class SymbolEvolutionSystem {
  public evolve(input: SymbolEvolutionInput): SymbolEvolutionResult {
    const inheritanceStrength = clamp01(
      input.historicalWeight * 0.4
        + input.publicAlignment * 0.25
        + input.restorationInfluence * 0.2
        - input.contradictionPressure * 0.15,
    );

    return {
      symbolId: input.symbolId,
      districtId: input.districtId,
      nextState: nextStateFor(input, inheritanceStrength),
      resonanceType: input.restorationInfluence >= input.contradictionPressure
        ? ResonanceType.Restoring
        : ResonanceType.Pressured,
      visibleRewrite: input.publicAlignment >= 0.45 || input.contradictionPressure >= 0.45,
      shouldPropagate: inheritanceStrength >= 0.5,
      inheritanceStrength,
    };
  }
}

function nextStateFor(
  input: SymbolEvolutionInput,
  inheritanceStrength: number,
): SymbolEvolutionState {
  if (input.contradictionPressure >= 0.75) return SymbolEvolutionState.ScarredSymbol;
  if (input.publicAlignment >= 0.65 && input.restorationInfluence >= 0.45) {
    return SymbolEvolutionState.RewrittenMark;
  }
  if (inheritanceStrength >= 0.75) return SymbolEvolutionState.InheritedMeaning;
  if (input.contradictionPressure >= 0.35) return SymbolEvolutionState.ContestedMeaning;
  return input.currentState;
}

function clamp01(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(1, value));
}
