import { createHash } from "node:crypto"

export const MECHANISM_DISCOVERY_FIXTURE_001B_SCHEMA =
  "MECHANISM-DISCOVERY-FIXTURE-001B-v0.1" as const

export type ResearchFamily = "CIVIC_METABOLISM" | "WORLD_SUBSTRATE"
export type ResearchTargetKey = "FIXTURE.SHARED_LOCAL_STATE_KEY"

export type SyntheticSharedToken =
  | "SYNTHETIC_SHARED_TOKEN"
  | "SYNTHETIC_SHARED_TOKEN_PERTURBED"
export type SyntheticCivicToken =
  | "SYNTHETIC_CM_TOKEN"
  | "SYNTHETIC_CM_TOKEN_PERTURBED"
export type SyntheticSubstrateToken =
  | "SYNTHETIC_WS_TOKEN"
  | "SYNTHETIC_WS_TOKEN_PERTURBED"

export interface FrozenResearchInput {
  fixtureId: "MDF-001B-FROZEN-INPUT-001"
  targetKey: ResearchTargetKey
  sharedToken: SyntheticSharedToken
  civicToken: SyntheticCivicToken
  substrateToken: SyntheticSubstrateToken
}

export interface ResearchProposal {
  proposalId: "MDF-CM-001" | "MDF-WS-001"
  family: ResearchFamily
  targetKey: ResearchTargetKey
  proposedEffect: "CIVIC_METABOLISM_EFFECT" | "WORLD_SUBSTRATE_EFFECT"
  sourceFixtureId: FrozenResearchInput["fixtureId"]
  observedSharedToken: FrozenResearchInput["sharedToken"]
  observedFamilyToken:
    | FrozenResearchInput["civicToken"]
    | FrozenResearchInput["substrateToken"]
}

export interface BaselineObservation {
  schema: typeof MECHANISM_DISCOVERY_FIXTURE_001B_SCHEMA
  frozenInput: FrozenResearchInput
  cmOnly: ResearchProposal
  wsOnly: ResearchProposal
  coPresence: readonly ResearchProposal[]
  reversedCoPresence: readonly ResearchProposal[]
  cmStableAcrossContexts: boolean
  wsStableAcrossContexts: boolean
  orderIndependentSet: boolean
  collisionDetected: boolean
  disposition: "HOLD_UNRESOLVED"
  winnerProposalId: null
  mergeApplied: false
  stateCommitApplied: false
  familyAuthority: "NONE"
  scheduler: "NONE"
  relationClassification: "PARALLEL_ONLY_BASELINE"
}

export function createMechanismDiscoveryFrozenInput001B(): FrozenResearchInput {
  return {
    fixtureId: "MDF-001B-FROZEN-INPUT-001",
    targetKey: "FIXTURE.SHARED_LOCAL_STATE_KEY",
    sharedToken: "SYNTHETIC_SHARED_TOKEN",
    civicToken: "SYNTHETIC_CM_TOKEN",
    substrateToken: "SYNTHETIC_WS_TOKEN",
  }
}

export function generateCivicMetabolismProposal001B(
  input: FrozenResearchInput,
): ResearchProposal {
  return {
    proposalId: "MDF-CM-001",
    family: "CIVIC_METABOLISM",
    targetKey: input.targetKey,
    proposedEffect: "CIVIC_METABOLISM_EFFECT",
    sourceFixtureId: input.fixtureId,
    observedSharedToken: input.sharedToken,
    observedFamilyToken: input.civicToken,
  }
}

export function generateWorldSubstrateProposal001B(
  input: FrozenResearchInput,
): ResearchProposal {
  return {
    proposalId: "MDF-WS-001",
    family: "WORLD_SUBSTRATE",
    targetKey: input.targetKey,
    proposedEffect: "WORLD_SUBSTRATE_EFFECT",
    sourceFixtureId: input.fixtureId,
    observedSharedToken: input.sharedToken,
    observedFamilyToken: input.substrateToken,
  }
}

function sortedProposalIds(proposals: readonly ResearchProposal[]): string {
  return proposals.map(proposal => proposal.proposalId).sort().join("|")
}

export function runMechanismDiscoveryFixture001B(): BaselineObservation {
  const frozenInput = createMechanismDiscoveryFrozenInput001B()

  const cmOnly = generateCivicMetabolismProposal001B(frozenInput)
  const wsOnly = generateWorldSubstrateProposal001B(frozenInput)

  const coPresence = [
    generateCivicMetabolismProposal001B(frozenInput),
    generateWorldSubstrateProposal001B(frozenInput),
  ] as const

  const reversedCoPresence = [
    generateWorldSubstrateProposal001B(frozenInput),
    generateCivicMetabolismProposal001B(frozenInput),
  ] as const

  const cmInCoPresence = coPresence.find(
    proposal => proposal.family === "CIVIC_METABOLISM",
  )
  const wsInCoPresence = coPresence.find(
    proposal => proposal.family === "WORLD_SUBSTRATE",
  )

  return {
    schema: MECHANISM_DISCOVERY_FIXTURE_001B_SCHEMA,
    frozenInput,
    cmOnly,
    wsOnly,
    coPresence,
    reversedCoPresence,
    cmStableAcrossContexts:
      JSON.stringify(cmOnly) === JSON.stringify(cmInCoPresence),
    wsStableAcrossContexts:
      JSON.stringify(wsOnly) === JSON.stringify(wsInCoPresence),
    orderIndependentSet:
      sortedProposalIds(coPresence) === sortedProposalIds(reversedCoPresence),
    collisionDetected:
      new Set(coPresence.map(proposal => proposal.targetKey)).size === 1,
    disposition: "HOLD_UNRESOLVED",
    winnerProposalId: null,
    mergeApplied: false,
    stateCommitApplied: false,
    familyAuthority: "NONE",
    scheduler: "NONE",
    relationClassification: "PARALLEL_ONLY_BASELINE",
  }
}

export function canonicalMechanismDiscoveryFixture001B(
  result: BaselineObservation,
): string {
  return JSON.stringify(result)
}

export function hashMechanismDiscoveryFixture001B(
  result: BaselineObservation,
): string {
  return createHash("sha256")
    .update(canonicalMechanismDiscoveryFixture001B(result))
    .digest("hex")
}

export function validateMechanismDiscoveryFixture001B(
  result: BaselineObservation,
): readonly string[] {
  const errors: string[] = []

  if (result.cmOnly.family !== "CIVIC_METABOLISM") {
    errors.push("CM_ISOLATION_WRONG_FAMILY")
  }
  if (result.wsOnly.family !== "WORLD_SUBSTRATE") {
    errors.push("WS_ISOLATION_WRONG_FAMILY")
  }
  if (result.coPresence.length !== 2) {
    errors.push("COPRESENCE_REQUIRES_TWO_PROPOSALS")
  }
  if (!result.cmStableAcrossContexts) {
    errors.push("CM_CHANGED_IN_COPRESENCE")
  }
  if (!result.wsStableAcrossContexts) {
    errors.push("WS_CHANGED_IN_COPRESENCE")
  }
  if (!result.orderIndependentSet) {
    errors.push("COPRESENCE_SET_DEPENDS_ON_ORDER")
  }
  if (!result.collisionDetected) {
    errors.push("SAME_KEY_COLLISION_NOT_DETECTED")
  }
  if (result.disposition !== "HOLD_UNRESOLVED") {
    errors.push("BASELINE_MUST_REMAIN_HELD")
  }
  if (result.winnerProposalId !== null) {
    errors.push("WINNER_MUST_NOT_BE_INVENTED")
  }
  if (result.mergeApplied) {
    errors.push("MERGE_MUST_NOT_BE_INVENTED")
  }
  if (result.stateCommitApplied) {
    errors.push("STATE_COMMIT_MUST_NOT_BE_INVENTED")
  }
  if (result.familyAuthority !== "NONE") {
    errors.push("FAMILY_AUTHORITY_MUST_NOT_BE_INVENTED")
  }
  if (result.scheduler !== "NONE") {
    errors.push("SCHEDULER_MUST_NOT_BE_INVENTED")
  }
  if (result.relationClassification !== "PARALLEL_ONLY_BASELINE") {
    errors.push("UNEXPECTED_BASELINE_RELATION_CLASSIFICATION")
  }

  return errors
}
