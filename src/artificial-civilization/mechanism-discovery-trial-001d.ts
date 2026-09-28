import { createHash } from "node:crypto"
import {
  createMechanismDiscoveryFrozenInput001B,
  generateCivicMetabolismProposal001B,
  generateWorldSubstrateProposal001B,
  type FrozenResearchInput,
  type ResearchProposal,
} from "./mechanism-discovery-fixture-001b.js"

export const MECHANISM_DISCOVERY_TRIAL_001D_SCHEMA =
  "MECHANISM-DISCOVERY-TRIAL-001D-v0.1" as const

export interface SharedPerturbationObservation {
  baselineInput: FrozenResearchInput
  perturbedInput: FrozenResearchInput
  baselineCm: ResearchProposal
  baselineWs: ResearchProposal
  perturbedCm: ResearchProposal
  perturbedWs: ResearchProposal
  cmChanged: boolean
  wsChanged: boolean
}

export interface MechanismDiscoveryTrial001DResult {
  schema: typeof MECHANISM_DISCOVERY_TRIAL_001D_SCHEMA
  observation: SharedPerturbationObservation
  cmFamilyTokenHeldConstant: boolean
  wsFamilyTokenHeldConstant: boolean
  sharedTokenChanged: boolean
  bothFamiliesResponded: boolean
  directCmToWsClaimPermitted: false
  directWsToCmClaimPermitted: false
  relationClassification:
    | "COMMON_UPSTREAM_RESPONSE_SUPPORTED"
    | "COMMON_UPSTREAM_RESPONSE_UNRESOLVED"
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

export function runMechanismDiscoveryTrial001D():
  MechanismDiscoveryTrial001DResult {
  const baselineInput = createMechanismDiscoveryFrozenInput001B()
  const perturbedInput: FrozenResearchInput = {
    ...baselineInput,
    sharedToken: "SYNTHETIC_SHARED_TOKEN_PERTURBED",
  }

  const baselineCm = generateCivicMetabolismProposal001B(baselineInput)
  const baselineWs = generateWorldSubstrateProposal001B(baselineInput)
  const perturbedCm = generateCivicMetabolismProposal001B(perturbedInput)
  const perturbedWs = generateWorldSubstrateProposal001B(perturbedInput)

  const observation: SharedPerturbationObservation = {
    baselineInput,
    perturbedInput,
    baselineCm,
    baselineWs,
    perturbedCm,
    perturbedWs,
    cmChanged: !sameProposal(baselineCm, perturbedCm),
    wsChanged: !sameProposal(baselineWs, perturbedWs),
  }

  return {
    schema: MECHANISM_DISCOVERY_TRIAL_001D_SCHEMA,
    observation,
    cmFamilyTokenHeldConstant:
      baselineInput.civicToken === perturbedInput.civicToken,
    wsFamilyTokenHeldConstant:
      baselineInput.substrateToken === perturbedInput.substrateToken,
    sharedTokenChanged:
      baselineInput.sharedToken !== perturbedInput.sharedToken,
    bothFamiliesResponded:
      observation.cmChanged && observation.wsChanged,
    directCmToWsClaimPermitted: false,
    directWsToCmClaimPermitted: false,
    relationClassification:
      observation.cmChanged && observation.wsChanged
        ? "COMMON_UPSTREAM_RESPONSE_SUPPORTED"
        : "COMMON_UPSTREAM_RESPONSE_UNRESOLVED",
    disposition: "HOLD_UNRESOLVED",
    winnerProposalId: null,
    mergeApplied: false,
    stateCommitApplied: false,
    familyAuthority: "NONE",
    scheduler: "NONE",
  }
}

export function canonicalMechanismDiscoveryTrial001D(
  result: MechanismDiscoveryTrial001DResult,
): string {
  return JSON.stringify(result)
}

export function hashMechanismDiscoveryTrial001D(
  result: MechanismDiscoveryTrial001DResult,
): string {
  return createHash("sha256")
    .update(canonicalMechanismDiscoveryTrial001D(result))
    .digest("hex")
}

export function validateMechanismDiscoveryTrial001D(
  result: MechanismDiscoveryTrial001DResult,
): readonly string[] {
  const errors: string[] = []

  if (!result.sharedTokenChanged) {
    errors.push("SHARED_TOKEN_WAS_NOT_PERTURBED")
  }
  if (!result.cmFamilyTokenHeldConstant) {
    errors.push("CM_FAMILY_TOKEN_CHANGED_DURING_SHARED_PERTURBATION")
  }
  if (!result.wsFamilyTokenHeldConstant) {
    errors.push("WS_FAMILY_TOKEN_CHANGED_DURING_SHARED_PERTURBATION")
  }
  if (!result.observation.cmChanged) {
    errors.push("SHARED_PERTURBATION_DID_NOT_CHANGE_CM_PROPOSAL")
  }
  if (!result.observation.wsChanged) {
    errors.push("SHARED_PERTURBATION_DID_NOT_CHANGE_WS_PROPOSAL")
  }
  if (!result.bothFamiliesResponded) {
    errors.push("BOTH_FAMILIES_DID_NOT_RESPOND_TO_SHARED_INPUT")
  }
  if (result.directCmToWsClaimPermitted) {
    errors.push("DIRECT_CM_TO_WS_CLAIM_MUST_NOT_BE_INFERRED")
  }
  if (result.directWsToCmClaimPermitted) {
    errors.push("DIRECT_WS_TO_CM_CLAIM_MUST_NOT_BE_INFERRED")
  }
  if (
    result.relationClassification !== "COMMON_UPSTREAM_RESPONSE_SUPPORTED"
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
