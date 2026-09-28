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

export const MECHANISM_DISCOVERY_TRIAL_001J_SCHEMA =
  "MECHANISM-DISCOVERY-TRIAL-001J-v0.1" as const

export interface ResponseRuleCondition {
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

export interface MechanismDiscoveryTrial001JResult {
  schema: typeof MECHANISM_DISCOVERY_TRIAL_001J_SCHEMA
  ruleEnabled: ResponseRuleCondition
  ruleDisabled: ResponseRuleCondition
  presentInputsByteIdentical: boolean
  historyCarriersByteIdentical: boolean
  currentProposalPayloadsByteIdentical: boolean
  onlyResponseRuleStateDiffers: boolean
  storedHistoryPresentInBothConditions: boolean
  residuePresentWhenRuleEnabled: boolean
  residueAbsentWhenRuleDisabled: boolean
  decouplingClassification:
    | "HISTORY_STORAGE_AND_RESPONSE_EXPRESSION_DECOUPLED"
    | "STORAGE_EXPRESSION_DECOUPLING_NOT_ESTABLISHED"
  storageNecessityClaimPermitted: false
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
  historyCarrier: SyntheticHistoryCarrier,
  responseRuleEnabled: boolean,
): ResponseRuleCondition {
  const residueActive =
    responseRuleEnabled &&
    historyCarrier.priorSharedAbsenceObserved

  return {
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

export function runMechanismDiscoveryTrial001J():
  MechanismDiscoveryTrial001JResult {
  const presentInputEnabled = createMechanismDiscoveryFrozenInput001B()
  const presentInputDisabled = createMechanismDiscoveryFrozenInput001B()

  const historyEnabled: SyntheticHistoryCarrier = {
    carrierId: "MDF-001G-HISTORY-CARRIER-001",
    priorSharedAbsenceObserved: true,
    priorAbsenceCount: 1,
    lastPriorSharedState: "SYNTHETIC_SHARED_TOKEN_ABSENT",
  }

  const historyDisabled: SyntheticHistoryCarrier = {
    ...historyEnabled,
  }

  const ruleEnabled = buildCondition(
    presentInputEnabled,
    historyEnabled,
    true,
  )
  const ruleDisabled = buildCondition(
    presentInputDisabled,
    historyDisabled,
    false,
  )

  const presentInputsByteIdentical =
    sameJson(ruleEnabled.presentInput, ruleDisabled.presentInput)

  const historyCarriersByteIdentical =
    sameJson(ruleEnabled.historyCarrier, ruleDisabled.historyCarrier)

  const currentProposalPayloadsByteIdentical =
    sameJson(
      ruleEnabled.cmCurrentProposal,
      ruleDisabled.cmCurrentProposal,
    ) &&
    sameJson(
      ruleEnabled.wsCurrentProposal,
      ruleDisabled.wsCurrentProposal,
    )

  const onlyResponseRuleStateDiffers =
    presentInputsByteIdentical &&
    historyCarriersByteIdentical &&
    currentProposalPayloadsByteIdentical &&
    ruleEnabled.responseRuleEnabled !==
      ruleDisabled.responseRuleEnabled

  const storedHistoryPresentInBothConditions =
    ruleEnabled.historyCarrier.priorSharedAbsenceObserved &&
    ruleDisabled.historyCarrier.priorSharedAbsenceObserved

  const residuePresentWhenRuleEnabled =
    ruleEnabled.cmResponseForm ===
      "RESIDUE_FORM_AFTER_PRIOR_SHARED_ABSENCE" &&
    ruleEnabled.wsResponseForm ===
      "RESIDUE_FORM_AFTER_PRIOR_SHARED_ABSENCE"

  const residueAbsentWhenRuleDisabled =
    ruleDisabled.cmResponseForm === "BASELINE_FORM" &&
    ruleDisabled.wsResponseForm === "BASELINE_FORM"

  const decouplingEstablished =
    onlyResponseRuleStateDiffers &&
    storedHistoryPresentInBothConditions &&
    residuePresentWhenRuleEnabled &&
    residueAbsentWhenRuleDisabled

  return {
    schema: MECHANISM_DISCOVERY_TRIAL_001J_SCHEMA,
    ruleEnabled,
    ruleDisabled,
    presentInputsByteIdentical,
    historyCarriersByteIdentical,
    currentProposalPayloadsByteIdentical,
    onlyResponseRuleStateDiffers,
    storedHistoryPresentInBothConditions,
    residuePresentWhenRuleEnabled,
    residueAbsentWhenRuleDisabled,
    decouplingClassification: decouplingEstablished
      ? "HISTORY_STORAGE_AND_RESPONSE_EXPRESSION_DECOUPLED"
      : "STORAGE_EXPRESSION_DECOUPLING_NOT_ESTABLISHED",
    storageNecessityClaimPermitted: false,
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

export function canonicalMechanismDiscoveryTrial001J(
  result: MechanismDiscoveryTrial001JResult,
): string {
  return JSON.stringify(result)
}

export function hashMechanismDiscoveryTrial001J(
  result: MechanismDiscoveryTrial001JResult,
): string {
  return createHash("sha256")
    .update(canonicalMechanismDiscoveryTrial001J(result))
    .digest("hex")
}

export function validateMechanismDiscoveryTrial001J(
  result: MechanismDiscoveryTrial001JResult,
): readonly string[] {
  const errors: string[] = []

  if (!result.presentInputsByteIdentical) {
    errors.push("PRESENT_INPUTS_MUST_MATCH")
  }
  if (!result.historyCarriersByteIdentical) {
    errors.push("HISTORY_CARRIERS_MUST_MATCH")
  }
  if (!result.currentProposalPayloadsByteIdentical) {
    errors.push("CURRENT_PROPOSAL_PAYLOADS_MUST_MATCH")
  }
  if (!result.onlyResponseRuleStateDiffers) {
    errors.push("RESPONSE_RULE_NOT_ISOLATED_AS_ONLY_DIFFERENCE")
  }
  if (!result.storedHistoryPresentInBothConditions) {
    errors.push("STORED_HISTORY_MUST_REMAIN_PRESENT")
  }
  if (!result.residuePresentWhenRuleEnabled) {
    errors.push("RESIDUE_NOT_PRESENT_WHEN_RULE_ENABLED")
  }
  if (!result.residueAbsentWhenRuleDisabled) {
    errors.push("RESIDUE_NOT_REMOVED_WHEN_RULE_DISABLED")
  }
  if (
    result.decouplingClassification !==
      "HISTORY_STORAGE_AND_RESPONSE_EXPRESSION_DECOUPLED"
  ) {
    errors.push("STORAGE_EXPRESSION_DECOUPLING_NOT_ESTABLISHED")
  }
  if (result.storageNecessityClaimPermitted) {
    errors.push("STORAGE_NECESSITY_CLAIM_MUST_NOT_BE_INFERRED")
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
