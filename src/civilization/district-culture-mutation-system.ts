import { CivilizationEra } from './civilization-evolution-cycle-system.js';
import { MythStage } from './civilization-myth-system.js';
import { RestorationLegacyStage } from '../restoration/restoration-legacy-system.js';
import { ResonanceType } from '../runtime/resonance-types.js';

export enum DistrictCultureTone {
  Stable = 'Stable',
  Guarded = 'Guarded',
  Fragmented = 'Fragmented',
  Restorative = 'Restorative',
  Reborn = 'Reborn',
  Mythic = 'Mythic',
}

export interface DistrictCultureMutationInput {
  readonly districtId: string;
  readonly era: CivilizationEra;
  readonly mythStage: MythStage;
  readonly restorationLegacyStage: RestorationLegacyStage;
  readonly dominantResonance: ResonanceType;
}

export interface DistrictCultureMutationResult {
  readonly districtId: string;
  readonly cultureTone: DistrictCultureTone;
  readonly symbolicInheritanceStrength: number;
  readonly restorationIdentityStrength: number;
  readonly pressureMemoryActive: boolean;
}

export class DistrictCultureMutationSystem {
  public mutate(input: DistrictCultureMutationInput): DistrictCultureMutationResult {
    const symbolicInheritanceStrength = symbolicStrength(input.mythStage);
    const restorationIdentityStrength = restorationStrength(input.restorationLegacyStage);

    return {
      districtId: input.districtId,
      cultureTone: resolveTone(input),
      symbolicInheritanceStrength,
      restorationIdentityStrength,
      pressureMemoryActive: input.dominantResonance === ResonanceType.Pressured,
    };
  }
}

function resolveTone(input: DistrictCultureMutationInput): DistrictCultureTone {
  if (input.era === CivilizationEra.Transcendent) return DistrictCultureTone.Mythic;
  if (input.era === CivilizationEra.Reborn) return DistrictCultureTone.Reborn;
  if (input.era === CivilizationEra.Fractured) return DistrictCultureTone.Fragmented;
  if (input.era === CivilizationEra.Strained) return DistrictCultureTone.Guarded;
  if (input.restorationLegacyStage === RestorationLegacyStage.ContinuityAnchor) return DistrictCultureTone.Restorative;
  return DistrictCultureTone.Stable;
}

function symbolicStrength(stage: MythStage): number {
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

function restorationStrength(stage: RestorationLegacyStage): number {
  switch (stage) {
    case RestorationLegacyStage.FreshRestoration:
      return 0.2;
    case RestorationLegacyStage.RememberedCare:
      return 0.35;
    case RestorationLegacyStage.DistrictPractice:
      return 0.55;
    case RestorationLegacyStage.CulturalTradition:
      return 0.75;
    case RestorationLegacyStage.ContinuityAnchor:
      return 1;
    default:
      return exhaustiveRestorationStageCheck(stage);
  }
}

function exhaustiveMythStageCheck(value: never): never {
  throw new Error(`Unhandled myth stage: ${String(value)}`);
}

function exhaustiveRestorationStageCheck(value: never): never {
  throw new Error(`Unhandled restoration legacy stage: ${String(value)}`);
}
