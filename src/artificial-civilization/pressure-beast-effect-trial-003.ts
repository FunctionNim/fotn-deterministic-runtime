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

export const PRESSURE_BEAST_EFFECT_TRIAL_003_SCHEMA =
  "PRESSURE-BEAST-EFFECT-TRIAL-003-v0.1" as const

export interface DambeastAccessPressure {
  beastId: "BEAST-012"
  canonicalName: "Dambeast"
  pressureFunction: "Local Tending / Outlet Control"
  active: boolean
}

export interface DambeastAccessCondition {
  phase: "BASELINE" | "PRESSURED" | "RETURNED"
  presentInput: FrozenResearchInput
  historyCarrier: SyntheticHistoryCarrier
  interpretationTarget: "PRIOR_SHARED_ABSENCE_HISTORY"
  certaintyState: "CONFIDENCE_MATCHES_AVAILABLE_EVIDENCE"
  pressure: DambeastAccessPressure
  cmCurrentProposal: ResearchProposal
  wsCurrentProposal: ResearchProposal
  storageState: "HISTORY_STORED_INTACT"
  readerAccessState:
    | "USABLE_ACCESS_OPEN"
    | "LOCAL_OUTLET_CONTROL_RESTRICTS_READER_ACCESS"
  readerCanAccessStoredHistory: boolean
  expressionState:
    | "RESIDUE_EXPRESSED"
    | "RESIDUE_WITHHELD_BY_ACCESS_GATE"
  deletionInferencePermitted: false
  exchangeRepairRequirement:
    | "NONE"
    | "OPEN_MEASURED_EXCHANGE_AND_RESTORE_USABLE_ACCESS"
}

export interface PressureBeastEffectTrial003Result {
  schema: typeof PRESSURE_BEAST_EFFECT_TRIAL_003_SCHEMA
  baseline: DambeastAccessCondition
  pressured: DambeastAccessCondition
  returned: DambeastAccessCondition
  presentInputsByteIdenticalAcrossPhases: boolean
  historyCarrierByteIdenticalAcrossPhases: boolean
  interpretationTargetIdenticalAcrossPhases: boolean
  certaintyStateIdenticalAcrossPhases: boolean
  currentProposalPayloadsByteIdenticalAcrossPhases: boolean
  storageMutatedByPressure: boolean
  accessRestrictedUnderPressure: boolean
  expressionWithheldByAccessGateWithoutDeletionInference: boolean
  usableAccessRecoveredAfterPressureRemoval: boolean
  qualification:
    | "DAMBEAST_ACCESS_PRESSURE_WITH_STORAGE_CERTAINTY_AND_TARGET_PRESERVED"
    | "DAMBEAST_EFFECT_NOT_ESTABLISHED"
  sourceBoundary:
    "SYNTHETIC_INTERACTION_CONTROL_NOT_BEAST_RUNTIME_OR_WORLD_CANON"
  biologicalMemoryClaimPermitted: false
  historicalArtificialCivilizationMemoryClaimPermitted: false
  beastRuntimeClaimPermitted: false
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
  phase: DambeastAccessCondition["phase"],
  presentInput: FrozenResearchInput,
  historyCarrier: SyntheticHistoryCarrier,
  pressureActive: boolean,
): DambeastAccessCondition {
  const pressure: DambeastAccessPressure = {
    beastId: "BEAST-012",
    canonicalName: "Dambeast",
    pressureFunction: "Local Tending / Outlet Control",
    active: pressureActive,
  }

  return {
    phase,
    presentInput,
    historyCarrier,
    interpretationTarget: "PRIOR_SHARED_ABSENCE_HISTORY",
    certaintyState: "CONFIDENCE_MATCHES_AVAILABLE_EVIDENCE",
    pressure,
    cmCurrentProposal:
      generateCivicMetabolismProposal001B(presentInput),
    wsCurrentProposal:
      generateWorldSubstrateProposal001B(presentInput),
    storageState: "HISTORY_STORED_INTACT",
    readerAccessState: pressureActive
      ? "LOCAL_OUTLET_CONTROL_RESTRICTS_READER_ACCESS"
      : "USABLE_ACCESS_OPEN",
    readerCanAccessStoredHistory: !pressureActive,
    expressionState: pressureActive
      ? "RESIDUE_WITHHELD_BY_ACCESS_GATE"
      : "RESIDUE_EXPRESSED",
    deletionInferencePermitted: false,
    exchangeRepairRequirement: pressureActive
      ? "OPEN_MEASURED_EXCHANGE_AND_RESTORE_USABLE_ACCESS"
      : "NONE",
  }
}

export function runPressureBeastEffectTrial003():
  PressureBeastEffectTrial003Result {
  const baselineInput = createMechanismDiscoveryFrozenInput001B()
  const pressuredInput = createMechanismDiscoveryFrozenInput001B()
  const returnedInput = createMechanismDiscoveryFrozenInput001B()

  const baselineCarrier: SyntheticHistoryCarrier = {
    carrierId: "MDF-001G-HISTORY-CARRIER-001",
    priorSharedAbsenceObserved: true,
    priorAbsenceCount: 1,
    lastPriorSharedState: "SYNTHETIC_SHARED_TOKEN_ABSENT",
  }
  const pressuredCarrier = { ...baselineCarrier }
  const returnedCarrier = { ...baselineCarrier }

  const baseline = buildCondition(
    "BASELINE",
    baselineInput,
    baselineCarrier,
    false,
  )
  const pressured = buildCondition(
    "PRESSURED",
    pressuredInput,
    pressuredCarrier,
    true,
  )
  const returned = buildCondition(
    "RETURNED",
    returnedInput,
    returnedCarrier,
    false,
  )

  const presentInputsByteIdenticalAcrossPhases =
    sameJson(baseline.presentInput, pressured.presentInput) &&
    sameJson(pressured.presentInput, returned.presentInput)

  const historyCarrierByteIdenticalAcrossPhases =
    sameJson(baseline.historyCarrier, pressured.historyCarrier) &&
    sameJson(pressured.historyCarrier, returned.historyCarrier)

  const interpretationTargetIdenticalAcrossPhases =
    baseline.interpretationTarget === pressured.interpretationTarget &&
    pressured.interpretationTarget === returned.interpretationTarget

  const certaintyStateIdenticalAcrossPhases =
    baseline.certaintyState === pressured.certaintyState &&
    pressured.certaintyState === returned.certaintyState

  const currentProposalPayloadsByteIdenticalAcrossPhases =
    sameJson(
      baseline.cmCurrentProposal,
      pressured.cmCurrentProposal,
    ) &&
    sameJson(
      pressured.cmCurrentProposal,
      returned.cmCurrentProposal,
    ) &&
    sameJson(
      baseline.wsCurrentProposal,
      pressured.wsCurrentProposal,
    ) &&
    sameJson(
      pressured.wsCurrentProposal,
      returned.wsCurrentProposal,
    )

  const storageMutatedByPressure =
    !historyCarrierByteIdenticalAcrossPhases ||
    pressured.storageState !== "HISTORY_STORED_INTACT"

  const accessRestrictedUnderPressure =
    baseline.readerAccessState === "USABLE_ACCESS_OPEN" &&
    baseline.readerCanAccessStoredHistory === true &&
    pressured.readerAccessState ===
      "LOCAL_OUTLET_CONTROL_RESTRICTS_READER_ACCESS" &&
    pressured.readerCanAccessStoredHistory === false

  const expressionWithheldByAccessGateWithoutDeletionInference =
    pressured.expressionState ===
      "RESIDUE_WITHHELD_BY_ACCESS_GATE" &&
    pressured.deletionInferencePermitted === false &&
    pressured.exchangeRepairRequirement ===
      "OPEN_MEASURED_EXCHANGE_AND_RESTORE_USABLE_ACCESS"

  const usableAccessRecoveredAfterPressureRemoval =
    returned.readerAccessState === baseline.readerAccessState &&
    returned.readerCanAccessStoredHistory === true &&
    returned.expressionState === baseline.expressionState &&
    returned.exchangeRepairRequirement === "NONE"

  const qualified =
    presentInputsByteIdenticalAcrossPhases &&
    historyCarrierByteIdenticalAcrossPhases &&
    interpretationTargetIdenticalAcrossPhases &&
    certaintyStateIdenticalAcrossPhases &&
    currentProposalPayloadsByteIdenticalAcrossPhases &&
    !storageMutatedByPressure &&
    accessRestrictedUnderPressure &&
    expressionWithheldByAccessGateWithoutDeletionInference &&
    usableAccessRecoveredAfterPressureRemoval

  return {
    schema: PRESSURE_BEAST_EFFECT_TRIAL_003_SCHEMA,
    baseline,
    pressured,
    returned,
    presentInputsByteIdenticalAcrossPhases,
    historyCarrierByteIdenticalAcrossPhases,
    interpretationTargetIdenticalAcrossPhases,
    certaintyStateIdenticalAcrossPhases,
    currentProposalPayloadsByteIdenticalAcrossPhases,
    storageMutatedByPressure,
    accessRestrictedUnderPressure,
    expressionWithheldByAccessGateWithoutDeletionInference,
    usableAccessRecoveredAfterPressureRemoval,
    qualification: qualified
      ? "DAMBEAST_ACCESS_PRESSURE_WITH_STORAGE_CERTAINTY_AND_TARGET_PRESERVED"
      : "DAMBEAST_EFFECT_NOT_ESTABLISHED",
    sourceBoundary:
      "SYNTHETIC_INTERACTION_CONTROL_NOT_BEAST_RUNTIME_OR_WORLD_CANON",
    biologicalMemoryClaimPermitted: false,
    historicalArtificialCivilizationMemoryClaimPermitted: false,
    beastRuntimeClaimPermitted: false,
    disposition: "HOLD_UNRESOLVED",
    winnerProposalId: null,
    mergeApplied: false,
    stateCommitApplied: false,
    familyAuthority: "NONE",
    scheduler: "NONE",
  }
}

export function canonicalPressureBeastEffectTrial003(
  result: PressureBeastEffectTrial003Result,
): string {
  return JSON.stringify(result)
}

export function hashPressureBeastEffectTrial003(
  result: PressureBeastEffectTrial003Result,
): string {
  return createHash("sha256")
    .update(canonicalPressureBeastEffectTrial003(result))
    .digest("hex")
}

export function validatePressureBeastEffectTrial003(
  result: PressureBeastEffectTrial003Result,
): readonly string[] {
  const errors: string[] = []

  if (!result.presentInputsByteIdenticalAcrossPhases) {
    errors.push("PRESENT_INPUTS_CHANGED_ACROSS_PRESSURE_PHASES")
  }
  if (!result.historyCarrierByteIdenticalAcrossPhases) {
    errors.push("HISTORY_CARRIER_CHANGED_UNDER_DAMBEAST_PRESSURE")
  }
  if (!result.interpretationTargetIdenticalAcrossPhases) {
    errors.push("INTERPRETATION_TARGET_CHANGED_UNDER_ACCESS_CONTROL")
  }
  if (!result.certaintyStateIdenticalAcrossPhases) {
    errors.push("CERTAINTY_STATE_CHANGED_UNDER_ACCESS_CONTROL")
  }
  if (!result.currentProposalPayloadsByteIdenticalAcrossPhases) {
    errors.push("CURRENT_PROPOSALS_CHANGED_UNDER_ACCESS_CONTROL")
  }
  if (result.storageMutatedByPressure) {
    errors.push("STORAGE_MUTATION_NOT_PERMITTED_IN_TRIAL_003")
  }
  if (!result.accessRestrictedUnderPressure) {
    errors.push("ACCESS_RESTRICTION_NOT_OBSERVED")
  }
  if (!result.expressionWithheldByAccessGateWithoutDeletionInference) {
    errors.push("SAFE_ACCESS_GATE_CONTROL_FAILED")
  }
  if (!result.usableAccessRecoveredAfterPressureRemoval) {
    errors.push("USABLE_ACCESS_DID_NOT_RECOVER_AFTER_PRESSURE_REMOVAL")
  }
  if (
    result.qualification !==
      "DAMBEAST_ACCESS_PRESSURE_WITH_STORAGE_CERTAINTY_AND_TARGET_PRESERVED"
  ) {
    errors.push("DAMBEAST_EFFECT_NOT_ESTABLISHED")
  }
  if (
    result.biologicalMemoryClaimPermitted ||
    result.historicalArtificialCivilizationMemoryClaimPermitted ||
    result.beastRuntimeClaimPermitted
  ) {
    errors.push("UNSUPPORTED_REAL_WORLD_OR_RUNTIME_CLAIM")
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
