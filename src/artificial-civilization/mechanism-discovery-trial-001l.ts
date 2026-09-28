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

export const MECHANISM_DISCOVERY_TRIAL_001L_SCHEMA =
  "MECHANISM-DISCOVERY-TRIAL-001L-v0.1" as const

export type DormantIntervalCount = 0 | 1 | 2 | 3 | 4

export interface RetentionRule {
  ruleId: "MDF-001L-RETENTION-RULE-001"
  fullyRetainedThroughInterval: 2
  expiredAtOrAfterInterval: 3
}

export interface RetentionObservation {
  interval: DormantIntervalCount
  presentInput: FrozenResearchInput
  currentCmProposal: ResearchProposal
  currentWsProposal: ResearchProposal
  sourceHistoryCarrier: SyntheticHistoryCarrier
  retainedHistoryCarrier: SyntheticHistoryCarrier | null
  retentionState:
    | "FULLY_RETAINED"
    | "EXPIRED_BY_EXPLICIT_SYNTHETIC_RULE"
  reactivationCapability:
    | "RESIDUE_REACTIVATABLE"
    | "RESIDUE_NOT_REACTIVATABLE_AFTER_EXPIRY"
}

export interface MechanismDiscoveryTrial001LResult {
  schema: typeof MECHANISM_DISCOVERY_TRIAL_001L_SCHEMA
  retentionRule: RetentionRule
  observations: readonly RetentionObservation[]
  presentInputsByteIdenticalAcrossIntervals: boolean
  currentProposalPayloadsByteIdenticalAcrossIntervals: boolean
  retainedThroughDeclaredBoundary: boolean
  expiredAtDeclaredBoundary: boolean
  decayClassification:
    | "FINITE_RETENTION_BY_EXPLICIT_SYNTHETIC_RULE"
    | "RETENTION_LIMIT_NOT_ESTABLISHED"
  realTimeMappingPermitted: false
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

function applyRetentionRule(
  carrier: SyntheticHistoryCarrier,
  interval: DormantIntervalCount,
  rule: RetentionRule,
): SyntheticHistoryCarrier | null {
  return interval <= rule.fullyRetainedThroughInterval
    ? { ...carrier }
    : null
}

function buildObservation(
  interval: DormantIntervalCount,
  input: FrozenResearchInput,
  sourceHistoryCarrier: SyntheticHistoryCarrier,
  rule: RetentionRule,
): RetentionObservation {
  const retainedHistoryCarrier =
    applyRetentionRule(sourceHistoryCarrier, interval, rule)

  return {
    interval,
    presentInput: input,
    currentCmProposal: generateCivicMetabolismProposal001B(input),
    currentWsProposal: generateWorldSubstrateProposal001B(input),
    sourceHistoryCarrier,
    retainedHistoryCarrier,
    retentionState: retainedHistoryCarrier
      ? "FULLY_RETAINED"
      : "EXPIRED_BY_EXPLICIT_SYNTHETIC_RULE",
    reactivationCapability:
      retainedHistoryCarrier?.priorSharedAbsenceObserved
        ? "RESIDUE_REACTIVATABLE"
        : "RESIDUE_NOT_REACTIVATABLE_AFTER_EXPIRY",
  }
}

export function runMechanismDiscoveryTrial001L():
  MechanismDiscoveryTrial001LResult {
  const retentionRule: RetentionRule = {
    ruleId: "MDF-001L-RETENTION-RULE-001",
    fullyRetainedThroughInterval: 2,
    expiredAtOrAfterInterval: 3,
  }

  const sourceHistoryCarrier: SyntheticHistoryCarrier = {
    carrierId: "MDF-001G-HISTORY-CARRIER-001",
    priorSharedAbsenceObserved: true,
    priorAbsenceCount: 1,
    lastPriorSharedState: "SYNTHETIC_SHARED_TOKEN_ABSENT",
  }

  const intervals: readonly DormantIntervalCount[] = [0, 1, 2, 3, 4]
  const observations = intervals.map(interval =>
    buildObservation(
      interval,
      createMechanismDiscoveryFrozenInput001B(),
      sourceHistoryCarrier,
      retentionRule,
    ),
  )

  const baseline = observations[0]

  const presentInputsByteIdenticalAcrossIntervals =
    observations.every(observation =>
      sameJson(observation.presentInput, baseline.presentInput),
    )

  const currentProposalPayloadsByteIdenticalAcrossIntervals =
    observations.every(observation =>
      sameJson(
        observation.currentCmProposal,
        baseline.currentCmProposal,
      ) &&
      sameJson(
        observation.currentWsProposal,
        baseline.currentWsProposal,
      ),
    )

  const retainedThroughDeclaredBoundary =
    observations
      .filter(observation => observation.interval <= 2)
      .every(observation =>
        observation.retentionState === "FULLY_RETAINED" &&
        observation.reactivationCapability ===
          "RESIDUE_REACTIVATABLE",
      )

  const expiredAtDeclaredBoundary =
    observations
      .filter(observation => observation.interval >= 3)
      .every(observation =>
        observation.retentionState ===
          "EXPIRED_BY_EXPLICIT_SYNTHETIC_RULE" &&
        observation.reactivationCapability ===
          "RESIDUE_NOT_REACTIVATABLE_AFTER_EXPIRY",
      )

  const qualified =
    presentInputsByteIdenticalAcrossIntervals &&
    currentProposalPayloadsByteIdenticalAcrossIntervals &&
    retainedThroughDeclaredBoundary &&
    expiredAtDeclaredBoundary

  return {
    schema: MECHANISM_DISCOVERY_TRIAL_001L_SCHEMA,
    retentionRule,
    observations,
    presentInputsByteIdenticalAcrossIntervals,
    currentProposalPayloadsByteIdenticalAcrossIntervals,
    retainedThroughDeclaredBoundary,
    expiredAtDeclaredBoundary,
    decayClassification: qualified
      ? "FINITE_RETENTION_BY_EXPLICIT_SYNTHETIC_RULE"
      : "RETENTION_LIMIT_NOT_ESTABLISHED",
    realTimeMappingPermitted: false,
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

export function canonicalMechanismDiscoveryTrial001L(
  result: MechanismDiscoveryTrial001LResult,
): string {
  return JSON.stringify(result)
}

export function hashMechanismDiscoveryTrial001L(
  result: MechanismDiscoveryTrial001LResult,
): string {
  return createHash("sha256")
    .update(canonicalMechanismDiscoveryTrial001L(result))
    .digest("hex")
}

export function validateMechanismDiscoveryTrial001L(
  result: MechanismDiscoveryTrial001LResult,
): readonly string[] {
  const errors: string[] = []

  if (!result.presentInputsByteIdenticalAcrossIntervals) {
    errors.push("PRESENT_INPUTS_CHANGED_ACROSS_INTERVALS")
  }
  if (!result.currentProposalPayloadsByteIdenticalAcrossIntervals) {
    errors.push("CURRENT_PROPOSAL_PAYLOADS_CHANGED_ACROSS_INTERVALS")
  }
  if (!result.retainedThroughDeclaredBoundary) {
    errors.push("RETENTION_NOT_PRESERVED_THROUGH_DECLARED_BOUNDARY")
  }
  if (!result.expiredAtDeclaredBoundary) {
    errors.push("EXPIRY_NOT_OBSERVED_AT_DECLARED_BOUNDARY")
  }
  if (
    result.decayClassification !==
      "FINITE_RETENTION_BY_EXPLICIT_SYNTHETIC_RULE"
  ) {
    errors.push("RETENTION_LIMIT_NOT_ESTABLISHED")
  }
  if (result.realTimeMappingPermitted) {
    errors.push("REAL_TIME_MAPPING_MUST_NOT_BE_INFERRED")
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
