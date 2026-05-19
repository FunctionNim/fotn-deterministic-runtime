export enum CivilizationEra {
  Flourishing = 'Flourishing',
  Strained = 'Strained',
  Fractured = 'Fractured',
  Restoring = 'Restoring',
  Reborn = 'Reborn',
  Transcendent = 'Transcendent',
}

export interface CivilizationEvolutionInput {
  readonly currentEra: CivilizationEra;
  readonly pressure: number;
  readonly resilience: number;
  readonly memoryDensity: number;
  readonly symbolicContinuity: number;
}

export interface CivilizationEvolutionResult {
  readonly nextEra: CivilizationEra;
  readonly continuityScore: number;
  readonly simplificationNeeded: boolean;
}

export class CivilizationEvolutionCycleSystem {
  public evolve(input: CivilizationEvolutionInput): CivilizationEvolutionResult {
    const continuityScore = clamp01(
      input.resilience * 0.35
        + input.memoryDensity * 0.25
        + input.symbolicContinuity * 0.25
        - input.pressure * 0.15,
    );

    return {
      nextEra: nextEra(input.currentEra, input.pressure, continuityScore),
      continuityScore,
      simplificationNeeded: input.memoryDensity > 0.85 && input.symbolicContinuity > 0.85,
    };
  }
}

function nextEra(
  current: CivilizationEra,
  pressure: number,
  continuityScore: number,
): CivilizationEra {
  if (pressure >= 0.85 && continuityScore < 0.35) return CivilizationEra.Fractured;
  if (continuityScore >= 0.85) return CivilizationEra.Transcendent;
  if (continuityScore >= 0.7) return CivilizationEra.Flourishing;
  if (continuityScore >= 0.5) return CivilizationEra.Restoring;
  if (pressure >= 0.55) return CivilizationEra.Strained;

  if (current === CivilizationEra.Fractured && continuityScore >= 0.4) {
    return CivilizationEra.Reborn;
  }

  return current;
}

function clamp01(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(1, value));
}
