import { createHash } from "node:crypto"
import {
  createMechanismDiscoveryFrozenInput001B,
  generateCivicMetabolismProposal001B,
  generateWorldSubstrateProposal001B,
  type FrozenResearchInput,
  type ResearchProposal,
} from "./mechanism-discovery-fixture-001b.js"

export const MECHANISM_DISCOVERY_TRIAL_001F_SCHEMA =
  "MECHANISM-DISCOVERY-TRIAL-001F-v0.1" as const

export interface RestorationSequenceObservation {
  baselineInput: FrozenResearchInput
  absentInput: FrozenResearchInput
  restoredInput: FrozenResearchInput
  baselineCm: ResearchProposal
  baselineWs: ResearchProposal
  absentCm: ResearchProposal
  absentWs: ResearchProposal
  restoredCm: ResearchProposal
  restoredWs: ResearchProposal
  cmReturnedToBaseline: boolean
  wsReturnedToBaseline: boolean
  residueObserved: boolean
}

export interface MechanismDiscoveryTrial001FResult {
  schema: typeof MECHANISM_DISCOVERY_TRIAL_001F_SCHEMA
  observation: RestorationSequenceObservation
  cmFamilyTokenHeldConstant: boolean
  wsFamilyTokenHeldConstant: boolean
  sharedInputRestored: boolean
  reversibilityClassification:
    | "FULLY_REVERSIBLE_NO_RESIDUE_OBSERVED"
    | "RESTORATION_INCOMPLETE_RESIDUE_CANDIDATE"
  directCmToWsClaimPermitted: false
  directWsToCmClaimPermitted: false
  historyMechanismClaimPermitted: false
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

export function runMechanismDiscoveryTrial001F():
  MechanismDiscoveryTrial001FResult {
  const baselineInput = createMechanismDiscoveryFrozenInput001B()
  const absentInput: FrozenResearchInput = {
    ...baselineInput,
    sharedToken: "SYNTHETIC_SHARED_TOKEN_ABSENT",
  }
  const restoredInput: FrozenResearchInput = {
    ...absentInput,
    sharedToken: "SYNTHETIC_SHARED_TOKEN",
  }

  const baselineCm = generateCivicMetabolismProposal001B(baselineInput)
  const baselineWs = generateWorldSubstrateProposal001B(baselineInput)
  const absentCm = generateCivicMetabolismProposal001B(absentInput)
  const absentWs = generateWorldSubstrateProposal001B(absentInput)
  const restoredCm = generateCivicMetabolismProposal001B(restoredInput)
  const restoredWs = generateWorldSubstrateProposal001B(restoredInput)

  const cmReturnedToBaseline = sameProposal(restoredCm, baselineCm)
  const wsReturnedToBaseline = sameProposal(restoredWs, baselineWs)
  const residueObserved =
    !cmReturnedToBaseline || !wsReturnedToBaseline

  return {
    schema: MECHANISM_DISCOVERY_TRIAL_001F_SCHEMA,
    observation: {
      baselineInput,
      absentInput,
      restoredInput,
      baselineCm,
      baselineWs,
      absentCm,
      absentWs,
      restoredCm,
      restoredWs,
      cmReturnedToBaseline,
      wsReturnedToBaseline,
      residueObserved,
    },
    cmFamilyTokenHeldConstant:
      baselineInput.civicToken === absentInput.civicToken &&
      absentInput.civicToken === restoredInput.civicToken,
    wsFamilyTokenHeldConstant:
      baselineInput.substrateToken === absentInput.substrateToken &&
      absentInput.substrateToken === restoredInput.substrateToken,
    sharedInputRestored:
      restoredInput.sharedToken === baselineInput.sharedToken,
    reversibilityClassification:
      cmReturnedToBaseline && wsReturnedToBaseline
        ? "FULLY_REVERSIBLE_NO_RESIDUE_OBSERVED"
        : "RESTORATION_INCOMPLETE_RESIDUE_CANDIDATE",
    directCmToWsClaimPermitted: false,
    directWsToCmClaimPermitted: false,
    historyMechanismClaimPermitted: false,
    disposition: "HOLD_UNRESOLVED",
    winnerProposalId: null,
    mergeApplied: false,
    stateCommitApplied: false,
    familyAuthority: "NONE",
    scheduler: "NONE",
  }
}

export function canonicalMechanismDiscoveryTrial001F(
  result: MechanismDiscoveryTrial001FResult,
): string {
  return JSON.stringify(result)
}

export function hashMechanismDiscoveryTrial001F(
  result: MechanismDiscoveryTrial001FResult,
): string {
  return createHash("sha256")
    .update(canonicalMechanismDiscoveryTrial001F(result))
    .digest("hex")
}

export function validateMechanismDiscoveryTrial001F(
  result: MechanismDiscoveryTrial001FResult,
): readonly string[] {
  const errors: string[] = []

  if (!result.cmFamilyTokenHeldConstant) {
    errors.push("CM_FAMILY_TOKEN_CHANGED_DURING_RESTORATION_SEQUENCE")
  }
  if (!result.wsFamilyTokenHeldConstant) {
    errors.push("WS_FAMILY_TOKEN_CHANGED_DURING_RESTORATION_SEQUENCE")
  }
  if (!result.sharedInputRestored) {
    errors.push("SHARED_INPUT_NOT_RESTORED_TO_BASELINE")
  }
  if (!result.observation.cmReturnedToBaseline) {
    errors.push("CM_DID_NOT_RETURN_TO_BASELINE")
  }
  if (!result.observation.wsReturnedToBaseline) {
    errors.push("WS_DID_NOT_RETURN_TO_BASELINE")
  }
  if (result.observation.residueObserved) {
    errors.push("UNEXPECTED_RESIDUE_OBSERVED")
  }
  if (
    result.reversibilityClassification !==
      "FULLY_REVERSIBLE_NO_RESIDUE_OBSERVED"
  ) {
    errors.push("UNEXPECTED_REVERSIBILITY_CLASSIFICATION")
  }
  if (result.historyMechanismClaimPermitted) {
    errors.push("HISTORY_MECHANISM_CLAIM_MUST_NOT_BE_INFERRED")
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
