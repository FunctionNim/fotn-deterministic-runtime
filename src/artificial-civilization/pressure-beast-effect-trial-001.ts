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

export const PRESSURE_BEAST_EFFECT_TRIAL_001_SCHEMA =
  "PRESSURE-BEAST-EFFECT-TRIAL-001-v0.1" as const

export interface BrumebeastInterpretationPressure {
  beastId: "BEAST-014"
  canonicalName: "Brumebeast"
  pressureFunction: "Obscured Structure / Interpretive Drift"
  active: boolean
}

export interface BrumebeastInterpretationCondition {
  phase: "BASELINE" | "PRESSURED" | "RETURNED"
  presentInput: FrozenResearchInput
  historyCarrier: SyntheticHistoryCarrier
  pressure: BrumebeastInterpretationPressure
  cmCurrentProposal: ResearchProposal
  wsCurrentProposal: ResearchProposal
  interpretationState:
    | "VERIFIED_HISTORY_READABLE"
    | "STRUCTURE_OBSCURED_VERIFICATION_REQUIRED"
  expressionState:
    | "RESIDUE_EXPRESSED"
    | "RESIDUE_HELD_PENDING_RELATION_VERIFICATION"
  absenceInferencePermitted: false
  verificationTarget:
    | "NONE"
    | "BOUNDARY_OR_SOURCE_OR_ROUTE_OR_SIGNAL"
}

export interface PressureBeastEffectTrial001Result {
  schema: typeof PRESSURE_BEAST_EFFECT_TRIAL_001_SCHEMA
  baseline: BrumebeastInterpretationCondition
  pressured: BrumebeastInterpretationCondition
  returned: BrumebeastInterpretationCondition
  presentInputsByteIdenticalAcrossPhases: boolean
  historyCarrierByteIdenticalAcrossPhases: boolean
  currentProposalPayloadsByteIdenticalAcrossPhases: boolean
  storageMutatedByPressure: boolean
  interpretationChangedUnderPressure: boolean
  expressionHeldWithoutAbsenceInference: boolean
  interpretationRecoveredAfterPressureRemoval: boolean
  qualification:
    | "BRUMEBEAST_INTERPRETATION_PRESSURE_WITH_STORAGE_PRESERVED"
    | "BRUMEBEAST_EFFECT_NOT_ESTABLISHED"
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
  phase: BrumebeastInterpretationCondition["phase"],
  presentInput: FrozenResearchInput,
  historyCarrier: SyntheticHistoryCarrier,
  pressureActive: boolean,
): BrumebeastInterpretationCondition {
  const pressure: BrumebeastInterpretationPressure = {
    beastId: "BEAST-014",
    canonicalName: "Brumebeast",
    pressureFunction: "Obscured Structure / Interpretive Drift",
    active: pressureActive,
  }

  const obscured = pressure.active

  return {
    phase,
    presentInput,
    historyCarrier,
    pressure,
    cmCurrentProposal:
      generateCivicMetabolismProposal001B(presentInput),
    wsCurrentProposal:
      generateWorldSubstrateProposal001B(presentInput),
    interpretationState: obscured
      ? "STRUCTURE_OBSCURED_VERIFICATION_REQUIRED"
      : "VERIFIED_HISTORY_READABLE",
    expressionState: obscured
      ? "RESIDUE_HELD_PENDING_RELATION_VERIFICATION"
      : "RESIDUE_EXPRESSED",
    absenceInferencePermitted: false,
    verificationTarget: obscured
      ? "BOUNDARY_OR_SOURCE_OR_ROUTE_OR_SIGNAL"
      : "NONE",
  }
}

export function runPressureBeastEffectTrial001():
  PressureBeastEffectTrial001Result {
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
    !historyCarrierByteIdenticalAcrossPhases

  const interpretationChangedUnderPressure =
    baseline.interpretationState ===
      "VERIFIED_HISTORY_READABLE" &&
    pressured.interpretationState ===
      "STRUCTURE_OBSCURED_VERIFICATION_REQUIRED"

  const expressionHeldWithoutAbsenceInference =
    pressured.expressionState ===
      "RESIDUE_HELD_PENDING_RELATION_VERIFICATION" &&
    pressured.absenceInferencePermitted === false &&
    pressured.verificationTarget ===
      "BOUNDARY_OR_SOURCE_OR_ROUTE_OR_SIGNAL"

  const interpretationRecoveredAfterPressureRemoval =
    returned.interpretationState ===
      baseline.interpretationState &&
    returned.expressionState === baseline.expressionState &&
    returned.absenceInferencePermitted === false

  const qualified =
    presentInputsByteIdenticalAcrossPhases &&
    historyCarrierByteIdenticalAcrossPhases &&
    currentProposalPayloadsByteIdenticalAcrossPhases &&
    !storageMutatedByPressure &&
    interpretationChangedUnderPressure &&
    expressionHeldWithoutAbsenceInference &&
    interpretationRecoveredAfterPressureRemoval

  return {
    schema: PRESSURE_BEAST_EFFECT_TRIAL_001_SCHEMA,
    baseline,
    pressured,
    returned,
    presentInputsByteIdenticalAcrossPhases,
    historyCarrierByteIdenticalAcrossPhases,
    currentProposalPayloadsByteIdenticalAcrossPhases,
    storageMutatedByPressure,
    interpretationChangedUnderPressure,
    expressionHeldWithoutAbsenceInference,
    interpretationRecoveredAfterPressureRemoval,
    qualification: qualified
      ? "BRUMEBEAST_INTERPRETATION_PRESSURE_WITH_STORAGE_PRESERVED"
      : "BRUMEBEAST_EFFECT_NOT_ESTABLISHED",
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

export function canonicalPressureBeastEffectTrial001(
  result: PressureBeastEffectTrial001Result,
): string {
  return JSON.stringify(result)
}

export function hashPressureBeastEffectTrial001(
  result: PressureBeastEffectTrial001Result,
): string {
  return createHash("sha256")
    .update(canonicalPressureBeastEffectTrial001(result))
    .digest("hex")
}

export function validatePressureBeastEffectTrial001(
  result: PressureBeastEffectTrial001Result,
): readonly string[] {
  const errors: string[] = []

  if (!result.presentInputsByteIdenticalAcrossPhases) {
    errors.push("PRESENT_INPUTS_CHANGED_ACROSS_PRESSURE_PHASES")
  }
  if (!result.historyCarrierByteIdenticalAcrossPhases) {
    errors.push("HISTORY_CARRIER_CHANGED_UNDER_BRUMEBEAST_PRESSURE")
  }
  if (!result.currentProposalPayloadsByteIdenticalAcrossPhases) {
    errors.push("CURRENT_PROPOSALS_CHANGED_UNDER_INTERPRETATION_CONTROL")
  }
  if (result.storageMutatedByPressure) {
    errors.push("STORAGE_MUTATION_NOT_PERMITTED_IN_TRIAL_001")
  }
  if (!result.interpretationChangedUnderPressure) {
    errors.push("INTERPRETATION_EFFECT_NOT_OBSERVED")
  }
  if (!result.expressionHeldWithoutAbsenceInference) {
    errors.push("SAFE_HOLD_OR_NO_ABSENCE_INFERENCE_FAILED")
  }
  if (!result.interpretationRecoveredAfterPressureRemoval) {
    errors.push("INTERPRETATION_DID_NOT_RECOVER_AFTER_PRESSURE_REMOVAL")
  }
  if (
    result.qualification !==
      "BRUMEBEAST_INTERPRETATION_PRESSURE_WITH_STORAGE_PRESERVED"
  ) {
    errors.push("BRUMEBEAST_EFFECT_NOT_ESTABLISHED")
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
