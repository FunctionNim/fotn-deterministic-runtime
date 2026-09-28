import { createHash } from "node:crypto"
import {
  createMechanismDiscoveryFrozenInput001B,
  generateCivicMetabolismProposal001B,
  generateWorldSubstrateProposal001B,
  type FrozenResearchInput,
  type ResearchProposal,
} from "./mechanism-discovery-fixture-001b.js"

export const MECHANISM_DISCOVERY_TRIAL_001C_SCHEMA =
  "MECHANISM-DISCOVERY-TRIAL-001C-v0.1" as const

export interface PerturbationComparison {
  baselineInput: FrozenResearchInput
  perturbedInput: FrozenResearchInput
  baselineCm: ResearchProposal
  baselineWs: ResearchProposal
  perturbedCm: ResearchProposal
  perturbedWs: ResearchProposal
  cmChanged: boolean
  wsChanged: boolean
}

export interface MechanismDiscoveryTrial001CResult {
  schema: typeof MECHANISM_DISCOVERY_TRIAL_001C_SCHEMA
  cmPerturbation: PerturbationComparison
  wsPerturbation: PerturbationComparison
  cmPerturbationCrossEffectOnWs: boolean
  wsPerturbationCrossEffectOnCm: boolean
  ownFamilyResponseObservedInBothDirections: boolean
  sharedTokenHeldConstant: boolean
  nonPerturbedFamilyTokenHeldConstant: boolean
  relationClassification:
    "PARALLEL_ONLY_PERTURBATION_SUPPORTED"
  disposition: "HOLD_UNRESOLVED"
  winnerProposalId: null
  mergeApplied: false
  stateCommitApplied: false
  familyAuthority: "NONE"
  scheduler: "NONE"
}

function sameProposal(a: ResearchProposal, b: ResearchProposal): boolean {
  return JSON.stringify(a) === JSON.stringify(b)
}

function runCmPerturbation(): PerturbationComparison {
  const baselineInput = createMechanismDiscoveryFrozenInput001B()
  const perturbedInput: FrozenResearchInput = {
    ...baselineInput,
    civicToken: "SYNTHETIC_CM_TOKEN_PERTURBED",
  }

  const baselineCm = generateCivicMetabolismProposal001B(baselineInput)
  const baselineWs = generateWorldSubstrateProposal001B(baselineInput)
  const perturbedCm = generateCivicMetabolismProposal001B(perturbedInput)
  const perturbedWs = generateWorldSubstrateProposal001B(perturbedInput)

  return {
    baselineInput,
    perturbedInput,
    baselineCm,
    baselineWs,
    perturbedCm,
    perturbedWs,
    cmChanged: !sameProposal(baselineCm, perturbedCm),
    wsChanged: !sameProposal(baselineWs, perturbedWs),
  }
}

function runWsPerturbation(): PerturbationComparison {
  const baselineInput = createMechanismDiscoveryFrozenInput001B()
  const perturbedInput: FrozenResearchInput = {
    ...baselineInput,
    substrateToken: "SYNTHETIC_WS_TOKEN_PERTURBED",
  }

  const baselineCm = generateCivicMetabolismProposal001B(baselineInput)
  const baselineWs = generateWorldSubstrateProposal001B(baselineInput)
  const perturbedCm = generateCivicMetabolismProposal001B(perturbedInput)
  const perturbedWs = generateWorldSubstrateProposal001B(perturbedInput)

  return {
    baselineInput,
    perturbedInput,
    baselineCm,
    baselineWs,
    perturbedCm,
    perturbedWs,
    cmChanged: !sameProposal(baselineCm, perturbedCm),
    wsChanged: !sameProposal(baselineWs, perturbedWs),
  }
}

export function runMechanismDiscoveryTrial001C():
  MechanismDiscoveryTrial001CResult {
  const cmPerturbation = runCmPerturbation()
  const wsPerturbation = runWsPerturbation()

  return {
    schema: MECHANISM_DISCOVERY_TRIAL_001C_SCHEMA,
    cmPerturbation,
    wsPerturbation,
    cmPerturbationCrossEffectOnWs: cmPerturbation.wsChanged,
    wsPerturbationCrossEffectOnCm: wsPerturbation.cmChanged,
    ownFamilyResponseObservedInBothDirections:
      cmPerturbation.cmChanged && wsPerturbation.wsChanged,
    sharedTokenHeldConstant:
      cmPerturbation.baselineInput.sharedToken ===
        cmPerturbation.perturbedInput.sharedToken &&
      wsPerturbation.baselineInput.sharedToken ===
        wsPerturbation.perturbedInput.sharedToken,
    nonPerturbedFamilyTokenHeldConstant:
      cmPerturbation.baselineInput.substrateToken ===
        cmPerturbation.perturbedInput.substrateToken &&
      wsPerturbation.baselineInput.civicToken ===
        wsPerturbation.perturbedInput.civicToken,
    relationClassification:
      "PARALLEL_ONLY_PERTURBATION_SUPPORTED",
    disposition: "HOLD_UNRESOLVED",
    winnerProposalId: null,
    mergeApplied: false,
    stateCommitApplied: false,
    familyAuthority: "NONE",
    scheduler: "NONE",
  }
}

export function canonicalMechanismDiscoveryTrial001C(
  result: MechanismDiscoveryTrial001CResult,
): string {
  return JSON.stringify(result)
}

export function hashMechanismDiscoveryTrial001C(
  result: MechanismDiscoveryTrial001CResult,
): string {
  return createHash("sha256")
    .update(canonicalMechanismDiscoveryTrial001C(result))
    .digest("hex")
}

export function validateMechanismDiscoveryTrial001C(
  result: MechanismDiscoveryTrial001CResult,
): readonly string[] {
  const errors: string[] = []

  if (!result.cmPerturbation.cmChanged) {
    errors.push("CM_PERTURBATION_DID_NOT_CHANGE_CM_PROPOSAL")
  }
  if (result.cmPerturbation.wsChanged) {
    errors.push("CM_PERTURBATION_CHANGED_WS_PROPOSAL")
  }
  if (!result.wsPerturbation.wsChanged) {
    errors.push("WS_PERTURBATION_DID_NOT_CHANGE_WS_PROPOSAL")
  }
  if (result.wsPerturbation.cmChanged) {
    errors.push("WS_PERTURBATION_CHANGED_CM_PROPOSAL")
  }
  if (
    result.cmPerturbation.baselineInput.sharedToken !==
      result.cmPerturbation.perturbedInput.sharedToken ||
    result.wsPerturbation.baselineInput.sharedToken !==
      result.wsPerturbation.perturbedInput.sharedToken
  ) {
    errors.push("SHARED_TOKEN_NOT_HELD_CONSTANT")
  }
  if (
    result.cmPerturbation.baselineInput.substrateToken !==
      result.cmPerturbation.perturbedInput.substrateToken ||
    result.wsPerturbation.baselineInput.civicToken !==
      result.wsPerturbation.perturbedInput.civicToken
  ) {
    errors.push("NON_PERTURBED_FAMILY_TOKEN_NOT_HELD_CONSTANT")
  }
  if (
    result.relationClassification !==
      "PARALLEL_ONLY_PERTURBATION_SUPPORTED"
  ) {
    errors.push("UNEXPECTED_RELATION_CLASSIFICATION")
  }
  if (result.disposition !== "HOLD_UNRESOLVED") {
    errors.push("COLLISION_DISPOSITION_CHANGED")
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
