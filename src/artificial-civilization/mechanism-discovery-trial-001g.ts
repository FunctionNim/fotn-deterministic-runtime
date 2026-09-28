import { createHash } from "node:crypto"
import {
  createMechanismDiscoveryFrozenInput001B,
  generateCivicMetabolismProposal001B,
  generateWorldSubstrateProposal001B,
  type FrozenResearchInput,
  type ResearchProposal,
} from "./mechanism-discovery-fixture-001b.js"

export const MECHANISM_DISCOVERY_TRIAL_001G_SCHEMA =
  "MECHANISM-DISCOVERY-TRIAL-001G-v0.1" as const

export interface SyntheticHistoryCarrier {
  carrierId: "MDF-001G-HISTORY-CARRIER-001"
  priorSharedAbsenceObserved: boolean
  priorAbsenceCount: 0 | 1
  lastPriorSharedState:
    | "SYNTHETIC_SHARED_TOKEN"
    | "SYNTHETIC_SHARED_TOKEN_ABSENT"
}

export interface HistoryAwareProposal {
  currentProposal: ResearchProposal
  currentInput: FrozenResearchInput
  historyCarrier: SyntheticHistoryCarrier
  responseForm:
    | "BASELINE_FORM"
    | "RESIDUE_FORM_AFTER_PRIOR_SHARED_ABSENCE"
}

export interface MechanismDiscoveryTrial001GResult {
  schema: typeof MECHANISM_DISCOVERY_TRIAL_001G_SCHEMA
  presentInputFresh: FrozenResearchInput
  presentInputExposed: FrozenResearchInput
  presentInputsByteIdentical: boolean
  freshHistory: SyntheticHistoryCarrier
  exposedHistory: SyntheticHistoryCarrier
  freshCm: HistoryAwareProposal
  freshWs: HistoryAwareProposal
  exposedCm: HistoryAwareProposal
  exposedWs: HistoryAwareProposal
  cmHistoryDependentDifferenceObserved: boolean
  wsHistoryDependentDifferenceObserved: boolean
  historyCarrierOnlyDifference: boolean
  positiveControlClassification:
    | "HYSTERESIS_POSITIVE_CONTROL_DETECTED"
    | "HYSTERESIS_POSITIVE_CONTROL_NOT_DETECTED"
  biologicalHysteresisClaimPermitted: false
  historicalArtificialCivilizationHysteresisClaimPermitted: false
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

function generateHistoryAwareCm(
  input: FrozenResearchInput,
  history: SyntheticHistoryCarrier,
): HistoryAwareProposal {
  return {
    currentProposal: generateCivicMetabolismProposal001B(input),
    currentInput: input,
    historyCarrier: history,
    responseForm: history.priorSharedAbsenceObserved
      ? "RESIDUE_FORM_AFTER_PRIOR_SHARED_ABSENCE"
      : "BASELINE_FORM",
  }
}

function generateHistoryAwareWs(
  input: FrozenResearchInput,
  history: SyntheticHistoryCarrier,
): HistoryAwareProposal {
  return {
    currentProposal: generateWorldSubstrateProposal001B(input),
    currentInput: input,
    historyCarrier: history,
    responseForm: history.priorSharedAbsenceObserved
      ? "RESIDUE_FORM_AFTER_PRIOR_SHARED_ABSENCE"
      : "BASELINE_FORM",
  }
}

export function runMechanismDiscoveryTrial001G():
  MechanismDiscoveryTrial001GResult {
  const presentInputFresh = createMechanismDiscoveryFrozenInput001B()
  const presentInputExposed = createMechanismDiscoveryFrozenInput001B()

  const freshHistory: SyntheticHistoryCarrier = {
    carrierId: "MDF-001G-HISTORY-CARRIER-001",
    priorSharedAbsenceObserved: false,
    priorAbsenceCount: 0,
    lastPriorSharedState: "SYNTHETIC_SHARED_TOKEN",
  }

  const exposedHistory: SyntheticHistoryCarrier = {
    carrierId: "MDF-001G-HISTORY-CARRIER-001",
    priorSharedAbsenceObserved: true,
    priorAbsenceCount: 1,
    lastPriorSharedState: "SYNTHETIC_SHARED_TOKEN_ABSENT",
  }

  const freshCm = generateHistoryAwareCm(presentInputFresh, freshHistory)
  const freshWs = generateHistoryAwareWs(presentInputFresh, freshHistory)
  const exposedCm = generateHistoryAwareCm(
    presentInputExposed,
    exposedHistory,
  )
  const exposedWs = generateHistoryAwareWs(
    presentInputExposed,
    exposedHistory,
  )

  const presentInputsByteIdentical =
    sameJson(presentInputFresh, presentInputExposed)

  const cmCurrentProposalUnchanged =
    sameJson(freshCm.currentProposal, exposedCm.currentProposal)
  const wsCurrentProposalUnchanged =
    sameJson(freshWs.currentProposal, exposedWs.currentProposal)

  const cmHistoryDependentDifferenceObserved =
    freshCm.responseForm !== exposedCm.responseForm
  const wsHistoryDependentDifferenceObserved =
    freshWs.responseForm !== exposedWs.responseForm

  const historyCarrierOnlyDifference =
    presentInputsByteIdentical &&
    cmCurrentProposalUnchanged &&
    wsCurrentProposalUnchanged &&
    !sameJson(freshHistory, exposedHistory)

  const positiveControlDetected =
    historyCarrierOnlyDifference &&
    cmHistoryDependentDifferenceObserved &&
    wsHistoryDependentDifferenceObserved

  return {
    schema: MECHANISM_DISCOVERY_TRIAL_001G_SCHEMA,
    presentInputFresh,
    presentInputExposed,
    presentInputsByteIdentical,
    freshHistory,
    exposedHistory,
    freshCm,
    freshWs,
    exposedCm,
    exposedWs,
    cmHistoryDependentDifferenceObserved,
    wsHistoryDependentDifferenceObserved,
    historyCarrierOnlyDifference,
    positiveControlClassification: positiveControlDetected
      ? "HYSTERESIS_POSITIVE_CONTROL_DETECTED"
      : "HYSTERESIS_POSITIVE_CONTROL_NOT_DETECTED",
    biologicalHysteresisClaimPermitted: false,
    historicalArtificialCivilizationHysteresisClaimPermitted: false,
    disposition: "HOLD_UNRESOLVED",
    winnerProposalId: null,
    mergeApplied: false,
    stateCommitApplied: false,
    familyAuthority: "NONE",
    scheduler: "NONE",
  }
}

export function canonicalMechanismDiscoveryTrial001G(
  result: MechanismDiscoveryTrial001GResult,
): string {
  return JSON.stringify(result)
}

export function hashMechanismDiscoveryTrial001G(
  result: MechanismDiscoveryTrial001GResult,
): string {
  return createHash("sha256")
    .update(canonicalMechanismDiscoveryTrial001G(result))
    .digest("hex")
}

export function validateMechanismDiscoveryTrial001G(
  result: MechanismDiscoveryTrial001GResult,
): readonly string[] {
  const errors: string[] = []

  if (!result.presentInputsByteIdentical) {
    errors.push("PRESENT_INPUTS_MUST_MATCH")
  }
  if (!result.historyCarrierOnlyDifference) {
    errors.push("HISTORY_CARRIER_NOT_ISOLATED_AS_ONLY_DIFFERENCE")
  }
  if (!result.cmHistoryDependentDifferenceObserved) {
    errors.push("CM_HISTORY_DEPENDENT_DIFFERENCE_NOT_OBSERVED")
  }
  if (!result.wsHistoryDependentDifferenceObserved) {
    errors.push("WS_HISTORY_DEPENDENT_DIFFERENCE_NOT_OBSERVED")
  }
  if (
    result.positiveControlClassification !==
      "HYSTERESIS_POSITIVE_CONTROL_DETECTED"
  ) {
    errors.push("POSITIVE_CONTROL_NOT_DETECTED")
  }
  if (result.biologicalHysteresisClaimPermitted) {
    errors.push("BIOLOGICAL_HYSTERESIS_CLAIM_MUST_NOT_BE_INFERRED")
  }
  if (result.historicalArtificialCivilizationHysteresisClaimPermitted) {
    errors.push(
      "HISTORICAL_ARTIFICIAL_CIVILIZATION_HYSTERESIS_CLAIM_MUST_NOT_BE_INFERRED",
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
