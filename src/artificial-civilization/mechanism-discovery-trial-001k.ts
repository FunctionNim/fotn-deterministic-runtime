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

export const MECHANISM_DISCOVERY_TRIAL_001K_SCHEMA =
  "MECHANISM-DISCOVERY-TRIAL-001K-v0.1" as const

export interface DormancyCycleObservation {
  cycleId: "DORMANT-1" | "DORMANT-2" | "REACTIVATED"
  presentInput: FrozenResearchInput
  historyCarrier: SyntheticHistoryCarrier
  responseRuleEnabled: boolean
  cmCurrentProposal: ResearchProposal
  wsCurrentProposal: ResearchProposal
  cmResponseForm:
    | "BASELINE_FORM"
    | "RESIDUE_FORM_AFTER_PRIOR_SHARED_ABSENCE"
  wsResponseForm:
    | "BASELINE_FORM"
    | "RESIDUE_FORM_AFTER_PRIOR_SHARED_ABSENCE"
}

export interface MechanismDiscoveryTrial001KResult {
  schema: typeof MECHANISM_DISCOVERY_TRIAL_001K_SCHEMA
  dormantCycle1: DormancyCycleObservation
  dormantCycle2: DormancyCycleObservation
  reactivatedCycle: DormancyCycleObservation
  presentInputsByteIdenticalAcrossCycles: boolean
  historyCarrierByteIdenticalAcrossCycles: boolean
  currentProposalPayloadsByteIdenticalAcrossCycles: boolean
  dormancyPreservedWithoutExpression: boolean
  residueAbsentDuringDormancy: boolean
  residueReturnedAfterRuleReactivation: boolean
  reactivationClassification:
    | "DORMANT_HISTORY_PRESERVED_AND_REACTIVATABLE"
    | "DORMANCY_REACTIVATION_NOT_ESTABLISHED"
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

function buildCycle(
  cycleId: DormancyCycleObservation["cycleId"],
  presentInput: FrozenResearchInput,
  historyCarrier: SyntheticHistoryCarrier,
  responseRuleEnabled: boolean,
): DormancyCycleObservation {
  const residueActive =
    responseRuleEnabled &&
    historyCarrier.priorSharedAbsenceObserved

  return {
    cycleId,
    presentInput,
    historyCarrier,
    responseRuleEnabled,
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

export function runMechanismDiscoveryTrial001K():
  MechanismDiscoveryTrial001KResult {
  const input1 = createMechanismDiscoveryFrozenInput001B()
  const input2 = createMechanismDiscoveryFrozenInput001B()
  const input3 = createMechanismDiscoveryFrozenInput001B()

  const carrier1: SyntheticHistoryCarrier = {
    carrierId: "MDF-001G-HISTORY-CARRIER-001",
    priorSharedAbsenceObserved: true,
    priorAbsenceCount: 1,
    lastPriorSharedState: "SYNTHETIC_SHARED_TOKEN_ABSENT",
  }
  const carrier2: SyntheticHistoryCarrier = { ...carrier1 }
  const carrier3: SyntheticHistoryCarrier = { ...carrier1 }

  const dormantCycle1 = buildCycle(
    "DORMANT-1",
    input1,
    carrier1,
    false,
  )
  const dormantCycle2 = buildCycle(
    "DORMANT-2",
    input2,
    carrier2,
    false,
  )
  const reactivatedCycle = buildCycle(
    "REACTIVATED",
    input3,
    carrier3,
    true,
  )

  const presentInputsByteIdenticalAcrossCycles =
    sameJson(dormantCycle1.presentInput, dormantCycle2.presentInput) &&
    sameJson(dormantCycle2.presentInput, reactivatedCycle.presentInput)

  const historyCarrierByteIdenticalAcrossCycles =
    sameJson(dormantCycle1.historyCarrier, dormantCycle2.historyCarrier) &&
    sameJson(dormantCycle2.historyCarrier, reactivatedCycle.historyCarrier)

  const currentProposalPayloadsByteIdenticalAcrossCycles =
    sameJson(
      dormantCycle1.cmCurrentProposal,
      dormantCycle2.cmCurrentProposal,
    ) &&
    sameJson(
      dormantCycle2.cmCurrentProposal,
      reactivatedCycle.cmCurrentProposal,
    ) &&
    sameJson(
      dormantCycle1.wsCurrentProposal,
      dormantCycle2.wsCurrentProposal,
    ) &&
    sameJson(
      dormantCycle2.wsCurrentProposal,
      reactivatedCycle.wsCurrentProposal,
    )

  const dormancyPreservedWithoutExpression =
    historyCarrierByteIdenticalAcrossCycles &&
    !dormantCycle1.responseRuleEnabled &&
    !dormantCycle2.responseRuleEnabled

  const residueAbsentDuringDormancy =
    dormantCycle1.cmResponseForm === "BASELINE_FORM" &&
    dormantCycle1.wsResponseForm === "BASELINE_FORM" &&
    dormantCycle2.cmResponseForm === "BASELINE_FORM" &&
    dormantCycle2.wsResponseForm === "BASELINE_FORM"

  const residueReturnedAfterRuleReactivation =
    reactivatedCycle.responseRuleEnabled &&
    reactivatedCycle.cmResponseForm ===
      "RESIDUE_FORM_AFTER_PRIOR_SHARED_ABSENCE" &&
    reactivatedCycle.wsResponseForm ===
      "RESIDUE_FORM_AFTER_PRIOR_SHARED_ABSENCE"

  const qualified =
    presentInputsByteIdenticalAcrossCycles &&
    historyCarrierByteIdenticalAcrossCycles &&
    currentProposalPayloadsByteIdenticalAcrossCycles &&
    dormancyPreservedWithoutExpression &&
    residueAbsentDuringDormancy &&
    residueReturnedAfterRuleReactivation

  return {
    schema: MECHANISM_DISCOVERY_TRIAL_001K_SCHEMA,
    dormantCycle1,
    dormantCycle2,
    reactivatedCycle,
    presentInputsByteIdenticalAcrossCycles,
    historyCarrierByteIdenticalAcrossCycles,
    currentProposalPayloadsByteIdenticalAcrossCycles,
    dormancyPreservedWithoutExpression,
    residueAbsentDuringDormancy,
    residueReturnedAfterRuleReactivation,
    reactivationClassification: qualified
      ? "DORMANT_HISTORY_PRESERVED_AND_REACTIVATABLE"
      : "DORMANCY_REACTIVATION_NOT_ESTABLISHED",
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

export function canonicalMechanismDiscoveryTrial001K(
  result: MechanismDiscoveryTrial001KResult,
): string {
  return JSON.stringify(result)
}

export function hashMechanismDiscoveryTrial001K(
  result: MechanismDiscoveryTrial001KResult,
): string {
  return createHash("sha256")
    .update(canonicalMechanismDiscoveryTrial001K(result))
    .digest("hex")
}

export function validateMechanismDiscoveryTrial001K(
  result: MechanismDiscoveryTrial001KResult,
): readonly string[] {
  const errors: string[] = []

  if (!result.presentInputsByteIdenticalAcrossCycles) {
    errors.push("PRESENT_INPUTS_MUST_MATCH_ACROSS_CYCLES")
  }
  if (!result.historyCarrierByteIdenticalAcrossCycles) {
    errors.push("HISTORY_CARRIER_CHANGED_DURING_DORMANCY_OR_REACTIVATION")
  }
  if (!result.currentProposalPayloadsByteIdenticalAcrossCycles) {
    errors.push("CURRENT_PROPOSAL_PAYLOADS_CHANGED_ACROSS_CYCLES")
  }
  if (!result.dormancyPreservedWithoutExpression) {
    errors.push("DORMANT_HISTORY_NOT_PRESERVED")
  }
  if (!result.residueAbsentDuringDormancy) {
    errors.push("RESIDUE_EXPRESSED_DURING_DORMANCY")
  }
  if (!result.residueReturnedAfterRuleReactivation) {
    errors.push("RESIDUE_DID_NOT_RETURN_AFTER_REACTIVATION")
  }
  if (
    result.reactivationClassification !==
      "DORMANT_HISTORY_PRESERVED_AND_REACTIVATABLE"
  ) {
    errors.push("DORMANCY_REACTIVATION_NOT_ESTABLISHED")
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
