import { DistrictCultureTone } from './district-culture-mutation-system.js';
import { MythStage } from './civilization-myth-system.js';
import { ResonanceType } from '../runtime/resonance-types.js';
export var CivilizationArchetype;
(function (CivilizationArchetype) {
    CivilizationArchetype["Restorer"] = "Restorer";
    CivilizationArchetype["Survivor"] = "Survivor";
    CivilizationArchetype["Witness"] = "Witness";
    CivilizationArchetype["Builder"] = "Builder";
    CivilizationArchetype["Wanderer"] = "Wanderer";
    CivilizationArchetype["Fractured"] = "Fractured";
    CivilizationArchetype["MythBearer"] = "MythBearer";
})(CivilizationArchetype || (CivilizationArchetype = {}));
export class CivilizationArchetypePropagationSystem {
    propagate(input) {
        const propagationStrength = clamp01(input.restorationIdentityStrength * 0.35
            + input.symbolicInheritanceStrength * 0.35
            + mythStrength(input.mythStage) * 0.3);
        return {
            districtId: input.districtId,
            archetype: resolveArchetype(input),
            propagationStrength,
            influenceGovernance: propagationStrength >= 0.55,
            influenceFutureMyths: propagationStrength >= 0.7,
        };
    }
}
function resolveArchetype(input) {
    if (input.mythStage === MythStage.Archetype)
        return CivilizationArchetype.MythBearer;
    if (input.cultureTone === DistrictCultureTone.Fragmented)
        return CivilizationArchetype.Fractured;
    if (input.cultureTone === DistrictCultureTone.Reborn)
        return CivilizationArchetype.Survivor;
    if (input.cultureTone === DistrictCultureTone.Restorative)
        return CivilizationArchetype.Restorer;
    if (input.dominantResonance === ResonanceType.Pressured)
        return CivilizationArchetype.Witness;
    if (input.symbolicInheritanceStrength >= 0.65)
        return CivilizationArchetype.Builder;
    return CivilizationArchetype.Wanderer;
}
function mythStrength(stage) {
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
function clamp01(value) {
    if (Number.isNaN(value))
        return 0;
    return Math.max(0, Math.min(1, value));
}
function exhaustiveMythStageCheck(value) {
    throw new Error(`Unhandled myth stage: ${String(value)}`);
}
