import { createHash } from "node:crypto"
import {
  createMechanismDiscoveryFrozenInput001B,
  generateCivicMetabolismProposal001B,
  generateWorldSubstrateProposal001B,
  type FrozenResearchInput,
  type ResearchProposal,
} from "./mechanism-discovery-fixture-001b.js"
import {
  type SyntheticHistoryCarrier,
} from "./mechanism-discovery-trial-001g.js"

export const MECHANISM_DISCOVERY_TRIAL_001H_SCHEMA =
  "MECHANISM-DISCOVERY-TRIAL-001H-v0.1" as const

export interface CarrierAblationCondition {
  presentInput: FrozenResearchInput
  priorExposureHistory: SyntheticHistoryCarrier
  carrierEffectEnabled: boolean
  cmCurrentProposal: ResearchProposal
  wsCurrentProposal: ResearchProposal
  cmResponseForm:
    | "BASELINE_FORM"
    | "RESIDUE_FORM_AFTER_PRIOR_SHARED_ABSENCE"
  wsResponseForm:
    | "BASELINE_FORM"
    | "RESIDUE_FORM_AFTER_PRIOR_SHARED_ABSENCE"
}

export interface MechanismDiscoveryTrial001HResult {
  schema: typeof MECHANISM_DISCOVERY_TRIAL_001H_SCHEMA
  carrierEnabled: CarrierAblationCondition
  carrierAblated: CarrierAblationCondition
  presentInputsByteIdentical: boolean
  priorExposureHistoriesByteIdentical: boolean
  currentProposalPayloadsByteIdentical: boolean
  onlyCarrierEffectStateDiffers: boolean
  residuePresentWithCarrierEnabled: boolean
  residueAbsentWithCarrierAblated: boolean
  causalNecessityClassification:
    | "EXPLICIT_HISTORY_CARRIER_EFFECT_CAUSALLY_NECESSARY_FOR_SYNTHETIC_RESIDUE"
    | "CAUSAL_NECESSITY_NOT_ESTABLISHED"
  sufficiencyClaimPermitted: false
  biologicalMemoryClaimPermitted: false
  historicalArtificialCivilizationMemoryClaimPermitted: false
  disposition: "HOLD_UNRESOLVED"
  winnerProposalId: null
  mergeApplied: false
  stateCommitApplied: false
  familyAuthority: "NONE"
  scheduler: "NONE"
}

function sameJson(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b)
}

function responseForm(
  history: SyntheticHistoryCarrier,
  carrierEffectEnabled: boolean,
): CarrierAblationCondition["cmResponseForm"] {
  return carrierEffectEnabled && history.priorSharedAbsenceObserved
    ? "RESIDUE_FORM_AFTER_PRIOR_SHARED_ABSENCE"
    : "BASELINE_FORM"
}

function buildCondition(
  presentInput: FrozenResearchInput,
  priorExposureHistory: SyntheticHistoryCarrier,
  carrierEffectEnabled: boolean,
): CarrierAblationCondition {
  return {
    presentInput,
    priorExposureHistory,
    carrierEffectEnabled,
    cmCurrentProposal:
      generateCivicMetabolismProposal001B(presentInput),
    wsCurrentProposal:
      generateWorldSubstrateProposal001B(presentInput),
    cmResponseForm:
      responseForm(priorExposureHistory, carrierEffectEnabled),
    wsResponseForm:
      responseForm(priorExposureHistory, carrierEffectEnabled),
  }
}

export function runMechanismDiscoveryTrial001H():
  MechanismDiscoveryTrial001HResult {
  const presentInputEnabled = createMechanismDiscoveryFrozenInput001B()
  const presentInputAblated = createMechanismDiscoveryFrozenInput001B()

  const priorExposureHistoryEnabled: SyntheticHistoryCarrier = {
    carrierId: "MDF-001G-HISTORY-CARRIER-001",
    priorSharedAbsenceObserved: true,
    priorAbsenceCount: 1,
    lastPriorSharedState: "SYNTHETIC_SHARED_TOKEN_ABSENT",
  }

  const priorExposureHistoryAblated: SyntheticHistoryCarrier = {
    ...priorExposureHistoryEnabled,
  }

  const carrierEnabled = buildCondition(
    presentInputEnabled,
    priorExposureHistoryEnabled,
    true,
  )

  const carrierAblated = buildCondition(
    presentInputAblated,
    priorExposureHistoryAblated,
    false,
  )

  const presentInputsByteIdentical =
    sameJson(carrierEnabled.presentInput, carrierAblated.presentInput)
  const priorExposureHistoriesByteIdentical =
    sameJson(
      carrierEnabled.priorExposureHistory,
      carrierAblated.priorExposureHistory,
    )
  const currentProposalPayloadsByteIdentical =
    sameJson(
      carrierEnabled.cmCurrentProposal,
      carrierAblated.cmCurrentProposal,
    ) &&
    sameJson(
      carrierEnabled.wsCurrentProposal,
      carrierAblated.wsCurrentProposal,
    )
  const onlyCarrierEffectStateDiffers =
    presentInputsByteIdentical &&
    priorExposureHistoriesByteIdentical &&
    currentProposalPayloadsByteIdentical &&
    carrierEnabled.carrierEffectEnabled !==
      carrierAblated.carrierEffectEnabled

  const residuePresentWithCarrierEnabled =
    carrierEnabled.cmResponseForm ===
      "RESIDUE_FORM_AFTER_PRIOR_SHARED_ABSENCE" &&
    carrierEnabled.wsResponseForm ===
      "RESIDUE_FORM_AFTER_PRIOR_SHARED_ABSENCE"

  const residueAbsentWithCarrierAblated =
    carrierAblated.cmResponseForm === "BASELINE_FORM" &&
    carrierAblated.wsResponseForm === "BASELINE_FORM"

  const causalNecessityEstablished =
    onlyCarrierEffectStateDiffers &&
    residuePresentWithCarrierEnabled &&
    residueAbsentWithCarrierAblated

  return {
    schema: MECHANISM_DISCOVERY_TRIAL_001H_SCHEMA,
    carrierEnabled,
    carrierAblated,
    presentInputsByteIdentical,
    priorExposureHistoriesByteIdentical,
    currentProposalPayloadsByteIdentical,
    onlyCarrierEffectStateDiffers,
    residuePresentWithCarrierEnabled,
    residueAbsentWithCarrierAblated,
    causalNecessityClassification:
      causalNecessityEstablished
        ? "EXPLICIT_HISTORY_CARRIER_EFFECT_CAUSALLY_NECESSARY_FOR_SYNTHETIC_RESIDUE"
        : "CAUSAL_NECESSITY_NOT_ESTABLISHED",
    sufficiencyClaimPermitted: false,
    biologicalMemoryClaimPermitted: false,
    historicalArtificialCivilizationMemoryClaimPermitted: false,
    disposition: "HOLD_UNRESOLVED",
    winnerProposalId: null,
    mergeApplied: false,
    stateCommitApplied: false,
    familyAuthority: "NONE",
    scheduler: "NONE",
  }
}

export function canonicalMechanismDiscoveryTrial001H(
  result: MechanismDiscoveryTrial001HResult,
): string {
  return JSON.stringify(result)
}

export function hashMechanismDiscoveryTrial001H(
  result: MechanismDiscoveryTrial001HResult,
): string {
  return createHash("sha256")
    .update(canonicalMechanismDiscoveryTrial001H(result))
    .digest("hex")
}

export function validateMechanismDiscoveryTrial001H(
  result: MechanismDiscoveryTrial001HResult,
): readonly string[] {
  const errors: string[] = []

  if (!result.presentInputsByteIdentical) {
    errors.push("PRESENT_INPUTS_MUST_MATCH")
  }
  if (!result.priorExposureHistoriesByteIdentical) {
    errors.push("PRIOR_EXPOSURE_HISTORY_MUST_MATCH")
  }
  if (!result.currentProposalPayloadsByteIdentical) {
    errors.push("CURRENT_PROPOSAL_PAYLOADS_MUST_MATCH")
  }
  if (!result.onlyCarrierEffectStateDiffers) {
    errors.push("CARRIER_EFFECT_NOT_ISOLATED_AS_ONLY_DIFFERENCE")
  }
  if (!result.residuePresentWithCarrierEnabled) {
    errors.push("RESIDUE_NOT_PRESENT_WITH_CARRIER_ENABLED")
  }
  if (!result.residueAbsentWithCarrierAblated) {
    errors.push("RESIDUE_NOT_REMOVED_BY_CARRIER_ABLATION")
  }
  if (
    result.causalNecessityClassification !==
      "EXPLICIT_HISTORY_CARRIER_EFFECT_CAUSALLY_NECESSARY_FOR_SYNTHETIC_RESIDUE"
  ) {
    errors.push("CAUSAL_NECESSITY_NOT_ESTABLISHED")
  }
  if (result.sufficiencyClaimPermitted) {
    errors.push("SUFFICIENCY_CLAIM_MUST_NOT_BE_INFERRED")
  }
  if (result.biologicalMemoryClaimPermitted) {
    errors.push("BIOLOGICAL_MEMORY_CLAIM_MUST_NOT_BE_INFERRED")
  }
  if (result.historicalArtificialCivilizationMemoryClaimPermitted) {
    errors.push(
      "HISTORICAL_ARTIFICIAL_CIVILIZATION_MEMORY_CLAIM_MUST_NOT_BE_INFERRED",
    )
  }
  if (
    result.winnerProposalId !== null ||
    result.mergeApplied ||
    result.stateCommitApplied
  ) {
    errors.push("RESOLUTION_BEHAVIOR_MUST_NOT_BE_INTRODUCED")
  }
  if (result.familyAuthority !== "NONE" || result.scheduler !== "NONE") {
    errors.push("AUTHORITY_OR_SCHEDULER_MUST_NOT_BE_INTRODUCED")
  }

  return errors
}
