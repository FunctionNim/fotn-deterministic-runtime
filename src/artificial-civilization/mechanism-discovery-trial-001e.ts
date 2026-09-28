import { createHash } from "node:crypto"
import {
  createMechanismDiscoveryFrozenInput001B,
  generateCivicMetabolismProposal001B,
  generateWorldSubstrateProposal001B,
  type FrozenResearchInput,
  type ResearchProposal,
} from "./mechanism-discovery-fixture-001b.js"

export const MECHANISM_DISCOVERY_TRIAL_001E_SCHEMA =
  "MECHANISM-DISCOVERY-TRIAL-001E-v0.1" as const

export interface SharedRemovalObservation {
  baselineInput: FrozenResearchInput
  absentSharedInput: FrozenResearchInput
  baselineCm: ResearchProposal
  baselineWs: ResearchProposal
  absentSharedCm: ResearchProposal
  absentSharedWs: ResearchProposal
  cmGeneratedWithSharedAbsent: boolean
  wsGeneratedWithSharedAbsent: boolean
  cmChanged: boolean
  wsChanged: boolean
}

export interface MechanismDiscoveryTrial001EResult {
  schema: typeof MECHANISM_DISCOVERY_TRIAL_001E_SCHEMA
  observation: SharedRemovalObservation
  cmFamilyTokenHeldConstant: boolean
  wsFamilyTokenHeldConstant: boolean
  sharedInputRemoved: boolean
  proposalGenerationNecessity:
    "SHARED_INPUT_NOT_REQUIRED_FOR_PROPOSAL_GENERATION"
  sharedDependentStateNecessity:
    "SHARED_INPUT_REQUIRED_FOR_BASELINE_SHARED_STATE"
  directCmToWsClaimPermitted: false
  directWsToCmClaimPermitted: false
  relationClassification:
    "COMMON_UPSTREAM_MODULATOR_NOT_GENERATION_PREREQUISITE"
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

export function runMechanismDiscoveryTrial001E():
  MechanismDiscoveryTrial001EResult {
  const baselineInput = createMechanismDiscoveryFrozenInput001B()
  const absentSharedInput: FrozenResearchInput = {
    ...baselineInput,
    sharedToken: "SYNTHETIC_SHARED_TOKEN_ABSENT",
  }

  const baselineCm = generateCivicMetabolismProposal001B(baselineInput)
  const baselineWs = generateWorldSubstrateProposal001B(baselineInput)
  const absentSharedCm = generateCivicMetabolismProposal001B(absentSharedInput)
  const absentSharedWs = generateWorldSubstrateProposal001B(absentSharedInput)

  const observation: SharedRemovalObservation = {
    baselineInput,
    absentSharedInput,
    baselineCm,
    baselineWs,
    absentSharedCm,
    absentSharedWs,
    cmGeneratedWithSharedAbsent: Boolean(absentSharedCm),
    wsGeneratedWithSharedAbsent: Boolean(absentSharedWs),
    cmChanged: !sameProposal(baselineCm, absentSharedCm),
    wsChanged: !sameProposal(baselineWs, absentSharedWs),
  }

  return {
    schema: MECHANISM_DISCOVERY_TRIAL_001E_SCHEMA,
    observation,
    cmFamilyTokenHeldConstant:
      baselineInput.civicToken === absentSharedInput.civicToken,
    wsFamilyTokenHeldConstant:
      baselineInput.substrateToken === absentSharedInput.substrateToken,
    sharedInputRemoved:
      absentSharedInput.sharedToken === "SYNTHETIC_SHARED_TOKEN_ABSENT",
    proposalGenerationNecessity:
      "SHARED_INPUT_NOT_REQUIRED_FOR_PROPOSAL_GENERATION",
    sharedDependentStateNecessity:
      "SHARED_INPUT_REQUIRED_FOR_BASELINE_SHARED_STATE",
    directCmToWsClaimPermitted: false,
    directWsToCmClaimPermitted: false,
    relationClassification:
      "COMMON_UPSTREAM_MODULATOR_NOT_GENERATION_PREREQUISITE",
    disposition: "HOLD_UNRESOLVED",
    winnerProposalId: null,
    mergeApplied: false,
    stateCommitApplied: false,
    familyAuthority: "NONE",
    scheduler: "NONE",
  }
}

export function canonicalMechanismDiscoveryTrial001E(
  result: MechanismDiscoveryTrial001EResult,
): string {
  return JSON.stringify(result)
}

export function hashMechanismDiscoveryTrial001E(
  result: MechanismDiscoveryTrial001EResult,
): string {
  return createHash("sha256")
    .update(canonicalMechanismDiscoveryTrial001E(result))
    .digest("hex")
}

export function validateMechanismDiscoveryTrial001E(
  result: MechanismDiscoveryTrial001EResult,
): readonly string[] {
  const errors: string[] = []

  if (!result.sharedInputRemoved) {
    errors.push("SHARED_INPUT_WAS_NOT_REMOVED")
  }
  if (!result.cmFamilyTokenHeldConstant) {
    errors.push("CM_FAMILY_TOKEN_CHANGED_DURING_SHARED_REMOVAL")
  }
  if (!result.wsFamilyTokenHeldConstant) {
    errors.push("WS_FAMILY_TOKEN_CHANGED_DURING_SHARED_REMOVAL")
  }
  if (!result.observation.cmGeneratedWithSharedAbsent) {
    errors.push("CM_PROPOSAL_FAILED_TO_GENERATE_WITH_SHARED_ABSENT")
  }
  if (!result.observation.wsGeneratedWithSharedAbsent) {
    errors.push("WS_PROPOSAL_FAILED_TO_GENERATE_WITH_SHARED_ABSENT")
  }
  if (!result.observation.cmChanged || !result.observation.wsChanged) {
    errors.push("SHARED_REMOVAL_DID_NOT_CHANGE_BOTH_PROPOSALS")
  }
  if (
    result.observation.absentSharedCm.observedSharedToken !==
      "SYNTHETIC_SHARED_TOKEN_ABSENT" ||
    result.observation.absentSharedWs.observedSharedToken !==
      "SYNTHETIC_SHARED_TOKEN_ABSENT"
  ) {
    errors.push("ABSENT_SHARED_STATE_NOT_OBSERVED_BY_BOTH_PROPOSALS")
  }
  if (
    result.proposalGenerationNecessity !==
      "SHARED_INPUT_NOT_REQUIRED_FOR_PROPOSAL_GENERATION"
  ) {
    errors.push("UNEXPECTED_GENERATION_NECESSITY_CLASSIFICATION")
  }
  if (
    result.sharedDependentStateNecessity !==
      "SHARED_INPUT_REQUIRED_FOR_BASELINE_SHARED_STATE"
  ) {
    errors.push("UNEXPECTED_SHARED_STATE_NECESSITY_CLASSIFICATION")
  }
  if (
    result.relationClassification !==
      "COMMON_UPSTREAM_MODULATOR_NOT_GENERATION_PREREQUISITE"
  ) {
    errors.push("UNEXPECTED_RELATION_CLASSIFICATION")
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
