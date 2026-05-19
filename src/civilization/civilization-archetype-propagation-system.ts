import { DistrictCultureTone } from './district-culture-mutation-system.js';
import { MythStage } from './civilization-myth-system.js';
import { ResonanceType } from '../runtime/resonance-types.js';

export enum CivilizationArchetype {
  Restorer = 'Restorer',
  Survivor = 'Survivor',
  Witness = 'Witness',
  Builder = 'Builder',
  Wanderer = 'Wanderer',
  Fractured = 'Fractured',
  MythBearer = 'MythBearer',
}

export interface CivilizationArchetypeInput {
  readonly districtId: string;
  readonly cultureTone: DistrictCultureTone;
  readonly mythStage: MythStage;
  readonly dominantResonance: ResonanceType;
  readonly restorationIdentityStrength: number;
  readonly symbolicInheritanceStrength: number;
}

export interface CivilizationArchetypeResult {
  readonly districtId: string;
  readonly archetype: CivilizationArchetype;
  readonly propagationStrength: number;
  readonly influenceGovernance: boolean;
  readonly influenceFutureMyths: boolean;
}

export class CivilizationArchetypePropagationSystem {
  public propagate(input: CivilizationArchetypeInput): CivilizationArchetypeResult {
    const propagationStrength = clamp01(
      input.restorationIdentityStrength * 0.35
        + input.symbolicInheritanceStrength * 0.35
        + mythStrength(input.mythStage) * 0.3,
    );

    return {
      districtId: input.districtId,
      archetype: resolveArchetype(input),
      propagationStrength,
      influenceGovernance: propagationStrength >= 0.55,
      influenceFutureMyths: propagationStrength >= 0.7,
    };
  }
}

function resolveArchetype(input: CivilizationArchetypeInput): CivilizationArchetype {
  if (input.mythStage === MythStage.Archetype) return CivilizationArchetype.MythBearer;
  if (input.cultureTone === DistrictCultureTone.Fragmented) return CivilizationArchetype.Fractured;
  if (input.cultureTone === DistrictCultureTone.Reborn) return CivilizationArchetype.Survivor;
  if (input.cultureTone === DistrictCultureTone.Restorative) return CivilizationArchetype.Restorer;
  if (input.dominantResonance === ResonanceType.Pressured) return CivilizationArchetype.Witness;
  if (input.symbolicInheritanceStrength >= 0.65) return CivilizationArchetype.Builder;
  return CivilizationArchetype.Wanderer;
}

function mythStrength(stage: MythStage): number {
  switch (stage) {
    case MythStage.Memory:
      return 0.2;
    case MythStage.RetoldStory:
      return 0.35;
    case MythStage.Folktale:
      return 0.55;
    case MythStage.Legend:
      return 0.75;
    case MythStage.Archetype:
      return 1;
    default:
      return exhaustiveMythStageCheck(stage);
  }
}

function clamp01(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

function exhaustiveMythStageCheck(value: never): never {
  throw new Error(`Unhandled myth stage: ${String(value)}`);
}
