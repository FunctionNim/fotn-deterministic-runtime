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

export const PRESSURE_BEAST_EFFECT_TRIAL_002_SCHEMA =
  "PRESSURE-BEAST-EFFECT-TRIAL-002-v0.1" as const

export interface VeilbeastExpressionPressure {
  beastId: "BEAST-015"
  canonicalName: "Veilbeast"
  pressureFunction: "Softened Certainty / Interpretive Pause"
  active: boolean
}

export interface VeilbeastExpressionCondition {
  phase: "BASELINE" | "PRESSURED" | "RETURNED"
  presentInput: FrozenResearchInput
  historyCarrier: SyntheticHistoryCarrier
  interpretationTarget:
    "PRIOR_SHARED_ABSENCE_HISTORY"
  pressure: VeilbeastExpressionPressure
  cmCurrentProposal: ResearchProposal
  wsCurrentProposal: ResearchProposal
  certaintyState:
    | "CONFIDENCE_MATCHES_AVAILABLE_EVIDENCE"
    | "SOFTENED_CERTAINTY_SECOND_WITNESS_REQUIRED"
  expressionState:
    | "RESIDUE_EXPRESSED"
    | "RESIDUE_WITHHELD_PENDING_SECOND_WITNESS"
  prematureActionPermitted: false
  permanentHesitationPermitted: false
  ambiguityPreservedHonestly: true
  nextWitnessRequirement: "NONE" | "SECOND_WITNESS"
}

export interface PressureBeastEffectTrial002Result {
  schema: typeof PRESSURE_BEAST_EFFECT_TRIAL_002_SCHEMA
  baseline: VeilbeastExpressionCondition
  pressured: VeilbeastExpressionCondition
  returned: VeilbeastExpressionCondition
  presentInputsByteIdenticalAcrossPhases: boolean
  historyCarrierByteIdenticalAcrossPhases: boolean
  interpretationTargetIdenticalAcrossPhases: boolean
  currentProposalPayloadsByteIdenticalAcrossPhases: boolean
  storageMutatedByPressure: boolean
  interpretationTargetMutatedByPressure: boolean
  certaintySoftenedUnderPressure: boolean
  expressionWithheldWithoutPrematureAction: boolean
  expressionRecoveredAfterPressureRemoval: boolean
  qualification:
    | "VEILBEAST_CERTAINTY_PRESSURE_WITH_STORAGE_AND_TARGET_PRESERVED"
    | "VEILBEAST_EFFECT_NOT_ESTABLISHED"
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
  phase: VeilbeastExpressionCondition["phase"],
  presentInput: FrozenResearchInput,
  historyCarrier: SyntheticHistoryCarrier,
  pressureActive: boolean,
): VeilbeastExpressionCondition {
  const pressure: VeilbeastExpressionPressure = {
    beastId: "BEAST-015",
    canonicalName: "Veilbeast",
    pressureFunction: "Softened Certainty / Interpretive Pause",
    active: pressureActive,
  }

  return {
    phase,
    presentInput,
    historyCarrier,
    interpretationTarget: "PRIOR_SHARED_ABSENCE_HISTORY",
    pressure,
    cmCurrentProposal:
      generateCivicMetabolismProposal001B(presentInput),
    wsCurrentProposal:
      generateWorldSubstrateProposal001B(presentInput),
    certaintyState: pressureActive
      ? "SOFTENED_CERTAINTY_SECOND_WITNESS_REQUIRED"
      : "CONFIDENCE_MATCHES_AVAILABLE_EVIDENCE",
    expressionState: pressureActive
      ? "RESIDUE_WITHHELD_PENDING_SECOND_WITNESS"
      : "RESIDUE_EXPRESSED",
    prematureActionPermitted: false,
    permanentHesitationPermitted: false,
    ambiguityPreservedHonestly: true,
    nextWitnessRequirement: pressureActive
      ? "SECOND_WITNESS"
      : "NONE",
  }
}

export function runPressureBeastEffectTrial002():
  PressureBeastEffectTrial002Result {
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

  const interpretationTargetMutatedByPressure =
    !interpretationTargetIdenticalAcrossPhases

  const certaintySoftenedUnderPressure =
    baseline.certaintyState ===
      "CONFIDENCE_MATCHES_AVAILABLE_EVIDENCE" &&
    pressured.certaintyState ===
      "SOFTENED_CERTAINTY_SECOND_WITNESS_REQUIRED"

  const expressionWithheldWithoutPrematureAction =
    pressured.expressionState ===
      "RESIDUE_WITHHELD_PENDING_SECOND_WITNESS" &&
    pressured.prematureActionPermitted === false &&
    pressured.permanentHesitationPermitted === false &&
    pressured.ambiguityPreservedHonestly === true &&
    pressured.nextWitnessRequirement === "SECOND_WITNESS"

  const expressionRecoveredAfterPressureRemoval =
    returned.certaintyState === baseline.certaintyState &&
    returned.expressionState === baseline.expressionState &&
    returned.nextWitnessRequirement === "NONE"

  const qualified =
    presentInputsByteIdenticalAcrossPhases &&
    historyCarrierByteIdenticalAcrossPhases &&
    interpretationTargetIdenticalAcrossPhases &&
    currentProposalPayloadsByteIdenticalAcrossPhases &&
    !storageMutatedByPressure &&
    !interpretationTargetMutatedByPressure &&
    certaintySoftenedUnderPressure &&
    expressionWithheldWithoutPrematureAction &&
    expressionRecoveredAfterPressureRemoval

  return {
    schema: PRESSURE_BEAST_EFFECT_TRIAL_002_SCHEMA,
    baseline,
    pressured,
    returned,
    presentInputsByteIdenticalAcrossPhases,
    historyCarrierByteIdenticalAcrossPhases,
    interpretationTargetIdenticalAcrossPhases,
    currentProposalPayloadsByteIdenticalAcrossPhases,
    storageMutatedByPressure,
    interpretationTargetMutatedByPressure,
    certaintySoftenedUnderPressure,
    expressionWithheldWithoutPrematureAction,
    expressionRecoveredAfterPressureRemoval,
    qualification: qualified
      ? "VEILBEAST_CERTAINTY_PRESSURE_WITH_STORAGE_AND_TARGET_PRESERVED"
      : "VEILBEAST_EFFECT_NOT_ESTABLISHED",
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

export function canonicalPressureBeastEffectTrial002(
  result: PressureBeastEffectTrial002Result,
): string {
  return JSON.stringify(result)
}

export function hashPressureBeastEffectTrial002(
  result: PressureBeastEffectTrial002Result,
): string {
  return createHash("sha256")
    .update(canonicalPressureBeastEffectTrial002(result))
    .digest("hex")
}

export function validatePressureBeastEffectTrial002(
  result: PressureBeastEffectTrial002Result,
): readonly string[] {
  const errors: string[] = []

  if (!result.presentInputsByteIdenticalAcrossPhases) {
    errors.push("PRESENT_INPUTS_CHANGED_ACROSS_PRESSURE_PHASES")
  }
  if (!result.historyCarrierByteIdenticalAcrossPhases) {
    errors.push("HISTORY_CARRIER_CHANGED_UNDER_VEILBEAST_PRESSURE")
  }
  if (!result.interpretationTargetIdenticalAcrossPhases) {
    errors.push("INTERPRETATION_TARGET_CHANGED_UNDER_CERTAINTY_CONTROL")
  }
  if (!result.currentProposalPayloadsByteIdenticalAcrossPhases) {
    errors.push("CURRENT_PROPOSALS_CHANGED_UNDER_CERTAINTY_CONTROL")
  }
  if (result.storageMutatedByPressure) {
    errors.push("STORAGE_MUTATION_NOT_PERMITTED_IN_TRIAL_002")
  }
  if (result.interpretationTargetMutatedByPressure) {
    errors.push("INTERPRETATION_TARGET_MUTATION_NOT_PERMITTED")
  }
  if (!result.certaintySoftenedUnderPressure) {
    errors.push("CERTAINTY_EFFECT_NOT_OBSERVED")
  }
  if (!result.expressionWithheldWithoutPrematureAction) {
    errors.push("SAFE_WITHHOLD_CONTROL_FAILED")
  }
  if (!result.expressionRecoveredAfterPressureRemoval) {
    errors.push("EXPRESSION_DID_NOT_RECOVER_AFTER_PRESSURE_REMOVAL")
  }
  if (
    result.qualification !==
      "VEILBEAST_CERTAINTY_PRESSURE_WITH_STORAGE_AND_TARGET_PRESERVED"
  ) {
    errors.push("VEILBEAST_EFFECT_NOT_ESTABLISHED")
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
