import { createHash } from "node:crypto"
import {
  hashFourFamilyLocalComposition001,
  runFourFamilyLocalComposition001,
  type FourFamilyLocalCompositionResult,
  type QualifiedLocalFamily,
} from "./four-family-local-composition-001.js"

export const SAME_KEY_COLLISION_HOLD_SCHEMA =
  "ACCQ-007-SAME-KEY-COLLISION-HOLD-001-v0.1" as const

export interface LocalStateProposal {
  proposalId: string
  family: QualifiedLocalFamily
  targetKey: "FIXTURE.SHARED_LOCAL_STATE_KEY"
  proposedEffect: string
}

export interface SameKeyCollisionHoldResult {
  schema: typeof SAME_KEY_COLLISION_HOLD_SCHEMA
  sourceQualificationHashBefore: string
  sourceQualificationHashAfter: string
  proposals: readonly LocalStateProposal[]
  collisionDetected: true
  collisionKey: "FIXTURE.SHARED_LOCAL_STATE_KEY"
  disposition: "HOLD_UNRESOLVED"
  winnerProposalId: null
  mergeApplied: false
  stateCommitApplied: false
  preservedProposalIds: readonly string[]
  sameKeyCompositionStatus: "HOLD"
  historyCountBefore: number
  historyCountAfter: number
}

export function runSameKeyCollisionHold001():
  SameKeyCollisionHoldResult {
  const source: FourFamilyLocalCompositionResult =
    runFourFamilyLocalComposition001()
  const sourceQualificationHashBefore =
    hashFourFamilyLocalComposition001(source)

  const proposals: readonly LocalStateProposal[] = [
    {
      proposalId: "PROP-CM-001",
      family: "CIVIC_METABOLISM",
      targetKey: "FIXTURE.SHARED_LOCAL_STATE_KEY",
      proposedEffect: "CIVIC_METABOLISM_EFFECT",
    },
    {
      proposalId: "PROP-WS-001",
      family: "WORLD_SUBSTRATE",
      targetKey: "FIXTURE.SHARED_LOCAL_STATE_KEY",
      proposedEffect: "WORLD_SUBSTRATE_EFFECT",
    },
  ]

  const historyCountBefore = source.historyCountAfter
  const historyCountAfter = source.historyCountAfter
  const sourceQualificationHashAfter =
    hashFourFamilyLocalComposition001(source)

  return {
    schema: SAME_KEY_COLLISION_HOLD_SCHEMA,
    sourceQualificationHashBefore,
    sourceQualificationHashAfter,
    proposals,
    collisionDetected: true,
    collisionKey: "FIXTURE.SHARED_LOCAL_STATE_KEY",
    disposition: "HOLD_UNRESOLVED",
    winnerProposalId: null,
    mergeApplied: false,
    stateCommitApplied: false,
    preservedProposalIds: proposals.map(proposal => proposal.proposalId),
    sameKeyCompositionStatus: "HOLD",
    historyCountBefore,
    historyCountAfter,
  }
}

export function canonicalSameKeyCollisionHold001(
  result: SameKeyCollisionHoldResult,
): string {
  return JSON.stringify(result)
}

export function hashSameKeyCollisionHold001(
  result: SameKeyCollisionHoldResult,
): string {
  return createHash("sha256")
    .update(canonicalSameKeyCollisionHold001(result))
    .digest("hex")
}

export function validateSameKeyCollisionHold001(
  result: SameKeyCollisionHoldResult,
): readonly string[] {
  const errors: string[] = []

  if (result.proposals.length !== 2) {
    errors.push("EXACTLY_TWO_COLLIDING_PROPOSALS_REQUIRED")
  }
  if (
    new Set(result.proposals.map(proposal => proposal.targetKey)).size !== 1
  ) {
    errors.push("PROPOSALS_DO_NOT_SHARE_ONE_TARGET_KEY")
  }
  if (
    new Set(result.proposals.map(proposal => proposal.family)).size !== 2
  ) {
    errors.push("PROPOSALS_MUST_COME_FROM_DISTINCT_LOCAL_FAMILIES")
  }
  if (!result.collisionDetected) {
    errors.push("SAME_KEY_COLLISION_NOT_DETECTED")
  }
  if (result.disposition !== "HOLD_UNRESOLVED") {
    errors.push("UNRESOLVED_COLLISION_MUST_HOLD")
  }
  if (result.winnerProposalId !== null) {
    errors.push("WINNER_MUST_NOT_BE_INVENTED")
  }
  if (result.mergeApplied) {
    errors.push("MERGE_MUST_NOT_BE_INVENTED")
  }
  if (result.stateCommitApplied) {
    errors.push("COLLIDING_STATE_MUST_NOT_COMMIT")
  }
  if (
    result.preservedProposalIds.join("|") !==
    result.proposals.map(proposal => proposal.proposalId).join("|")
  ) {
    errors.push("COLLIDING_PROPOSAL_EVIDENCE_NOT_PRESERVED")
  }
  if (result.sameKeyCompositionStatus !== "HOLD") {
    errors.push("SAME_KEY_COMPOSITION_LAW_MUST_REMAIN_HELD")
  }
  if (result.historyCountBefore !== result.historyCountAfter) {
    errors.push("COLLISION_HOLD_MUTATED_HISTORY")
  }
  if (
    result.sourceQualificationHashBefore !==
    result.sourceQualificationHashAfter
  ) {
    errors.push("QUALIFIED_ACC006_SOURCE_MUTATED")
  }

  return errors
}
