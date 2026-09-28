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

export const MECHANISM_DISCOVERY_TRIAL_001I_SCHEMA =
  "MECHANISM-DISCOVERY-TRIAL-001I-v0.1" as const

export interface SufficiencyCondition {
  presentInput: FrozenResearchInput
  historyCarrier: SyntheticHistoryCarrier | null
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

export interface MechanismDiscoveryTrial001IResult {
  schema: typeof MECHANISM_DISCOVERY_TRIAL_001I_SCHEMA
  noCarrierBaseline: SufficiencyCondition
  carrierIntroduced: SufficiencyCondition
  presentInputsByteIdentical: boolean
  currentProposalPayloadsByteIdentical: boolean
  carrierIntroductionOnlyDifference: boolean
  residueAbsentWithoutCarrier: boolean
  residuePresentAfterCarrierIntroduction: boolean
  sufficiencyClassification:
    | "EXPLICIT_HISTORY_CARRIER_WITH_DEFINED_PRIOR_EXPOSURE_SUFFICIENT_FOR_SYNTHETIC_RESIDUE"
    | "SUFFICIENCY_NOT_ESTABLISHED"
  necessityResultPreserved: true
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

function buildCondition(
  presentInput: FrozenResearchInput,
  historyCarrier: SyntheticHistoryCarrier | null,
  carrierEffectEnabled: boolean,
): SufficiencyCondition {
  const residueActive =
    carrierEffectEnabled &&
    historyCarrier?.priorSharedAbsenceObserved === true

  return {
    presentInput,
    historyCarrier,
    carrierEffectEnabled,
    cmCurrentProposal:
      generateCivicMetabolismProposal001B(presentInput),
    wsCurrentProposal:
      generateWorldSubstrateProposal001B(presentInput),
    cmResponseForm: residueActive
      ? "RESIDUE_FORM_AFTER_PRIOR_SHARED_ABSENCE"
      : "BASELINE_FORM",
    wsResponseForm: residueActive
      ? "RESIDUE_FORM_AFTER_PRIOR_SHARED_ABSENCE"
      : "BASELINE_FORM",
  }
}

export function runMechanismDiscoveryTrial001I():
  MechanismDiscoveryTrial001IResult {
  const presentInputBaseline = createMechanismDiscoveryFrozenInput001B()
  const presentInputCarrier = createMechanismDiscoveryFrozenInput001B()

  const noCarrierBaseline = buildCondition(
    presentInputBaseline,
    null,
    false,
  )

  const introducedHistory: SyntheticHistoryCarrier = {
    carrierId: "MDF-001G-HISTORY-CARRIER-001",
    priorSharedAbsenceObserved: true,
    priorAbsenceCount: 1,
    lastPriorSharedState: "SYNTHETIC_SHARED_TOKEN_ABSENT",
  }

  const carrierIntroduced = buildCondition(
    presentInputCarrier,
    introducedHistory,
    true,
  )

  const presentInputsByteIdentical =
    sameJson(
      noCarrierBaseline.presentInput,
      carrierIntroduced.presentInput,
    )

  const currentProposalPayloadsByteIdentical =
    sameJson(
      noCarrierBaseline.cmCurrentProposal,
      carrierIntroduced.cmCurrentProposal,
    ) &&
    sameJson(
      noCarrierBaseline.wsCurrentProposal,
      carrierIntroduced.wsCurrentProposal,
    )

  const residueAbsentWithoutCarrier =
    noCarrierBaseline.cmResponseForm === "BASELINE_FORM" &&
    noCarrierBaseline.wsResponseForm === "BASELINE_FORM"

  const residuePresentAfterCarrierIntroduction =
    carrierIntroduced.cmResponseForm ===
      "RESIDUE_FORM_AFTER_PRIOR_SHARED_ABSENCE" &&
    carrierIntroduced.wsResponseForm ===
      "RESIDUE_FORM_AFTER_PRIOR_SHARED_ABSENCE"

  const carrierIntroductionOnlyDifference =
    presentInputsByteIdentical &&
    currentProposalPayloadsByteIdentical &&
    noCarrierBaseline.historyCarrier === null &&
    noCarrierBaseline.carrierEffectEnabled === false &&
    carrierIntroduced.historyCarrier !== null &&
    carrierIntroduced.carrierEffectEnabled === true

  const sufficiencyEstablished =
    carrierIntroductionOnlyDifference &&
    residueAbsentWithoutCarrier &&
    residuePresentAfterCarrierIntroduction

  return {
    schema: MECHANISM_DISCOVERY_TRIAL_001I_SCHEMA,
    noCarrierBaseline,
    carrierIntroduced,
    presentInputsByteIdentical,
    currentProposalPayloadsByteIdentical,
    carrierIntroductionOnlyDifference,
    residueAbsentWithoutCarrier,
    residuePresentAfterCarrierIntroduction,
    sufficiencyClassification: sufficiencyEstablished
      ? "EXPLICIT_HISTORY_CARRIER_WITH_DEFINED_PRIOR_EXPOSURE_SUFFICIENT_FOR_SYNTHETIC_RESIDUE"
      : "SUFFICIENCY_NOT_ESTABLISHED",
    necessityResultPreserved: true,
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

export function canonicalMechanismDiscoveryTrial001I(
  result: MechanismDiscoveryTrial001IResult,
): string {
  return JSON.stringify(result)
}

export function hashMechanismDiscoveryTrial001I(
  result: MechanismDiscoveryTrial001IResult,
): string {
  return createHash("sha256")
    .update(canonicalMechanismDiscoveryTrial001I(result))
    .digest("hex")
}

export function validateMechanismDiscoveryTrial001I(
  result: MechanismDiscoveryTrial001IResult,
): readonly string[] {
  const errors: string[] = []

  if (!result.presentInputsByteIdentical) {
    errors.push("PRESENT_INPUTS_MUST_MATCH")
  }
  if (!result.currentProposalPayloadsByteIdentical) {
    errors.push("CURRENT_PROPOSAL_PAYLOADS_MUST_MATCH")
  }
  if (!result.carrierIntroductionOnlyDifference) {
    errors.push("CARRIER_INTRODUCTION_NOT_ISOLATED")
  }
  if (!result.residueAbsentWithoutCarrier) {
    errors.push("BASELINE_ALREADY_CONTAINS_RESIDUE")
  }
  if (!result.residuePresentAfterCarrierIntroduction) {
    errors.push("CARRIER_INTRODUCTION_DID_NOT_PRODUCE_RESIDUE")
  }
  if (
    result.sufficiencyClassification !==
      "EXPLICIT_HISTORY_CARRIER_WITH_DEFINED_PRIOR_EXPOSURE_SUFFICIENT_FOR_SYNTHETIC_RESIDUE"
  ) {
    errors.push("SUFFICIENCY_NOT_ESTABLISHED")
  }
  if (!result.necessityResultPreserved) {
    errors.push("NECESSITY_RESULT_MUST_REMAIN_PRESERVED")
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
