import { createHash } from "node:crypto"
import {
  hashSameKeyCollisionHold001,
  runSameKeyCollisionHold001,
  type SameKeyCollisionHoldResult,
} from "./same-key-collision-hold-001.js"
import type {
  QualifiedLocalFamily,
} from "./four-family-local-composition-001.js"

export const HIGHER_SCOPE_RESOLUTION_ADMISSION_SCHEMA =
  "ACCQ-008-HIGHER-SCOPE-RESOLUTION-ADMISSION-001-v0.1" as const

export interface ResolutionAuthorityCandidate {
  candidateId: string
  candidateType:
    | "LOCAL_FAMILY_SELF_AUTHORITY"
    | "HIGHER_SCOPE_RULE_CANDIDATE"
  issuerId: string
  issuerIsLocalFamily: boolean
  coveredKey: "FIXTURE.SHARED_LOCAL_STATE_KEY" | "OTHER_KEY"
  coveredFamilies: readonly QualifiedLocalFamily[]
  deterministicRuleId: string | null
  version: string | null
  provenanceRecordId: string | null
}

export interface ResolutionAuthorityAdmission {
  candidateId: string
  admitted: boolean
  reasons: readonly string[]
}

export interface HigherScopeResolutionAdmissionResult {
  schema: typeof HIGHER_SCOPE_RESOLUTION_ADMISSION_SCHEMA
  sourceQualificationHashBefore: string
  sourceQualificationHashAfter: string
  collisionDispositionBefore: "HOLD_UNRESOLVED"
  candidates: readonly ResolutionAuthorityCandidate[]
  admissions: readonly ResolutionAuthorityAdmission[]
  admittedCandidateIds: readonly string[]
  resolutionApplied: false
  winnerProposalId: null
  mergeApplied: false
  stateCommitApplied: false
  finalDisposition: "HOLD_UNRESOLVED"
  authorityLawStatus: "AWAITING_QUALIFIED_HIGHER_SCOPE_RULE"
  historyCountBefore: number
  historyCountAfter: number
}

function evaluateCandidate(
  candidate: ResolutionAuthorityCandidate,
): ResolutionAuthorityAdmission {
  const reasons: string[] = []

  if (candidate.issuerIsLocalFamily) {
    reasons.push("LOCAL_FAMILY_CANNOT_AUTHOR_PEER_RESOLUTION_AUTHORITY")
  }
  if (candidate.candidateType !== "HIGHER_SCOPE_RULE_CANDIDATE") {
    reasons.push("CANDIDATE_IS_NOT_HIGHER_SCOPE")
  }
  if (candidate.coveredKey !== "FIXTURE.SHARED_LOCAL_STATE_KEY") {
    reasons.push("COLLIDED_KEY_OUT_OF_SCOPE")
  }

  const requiredFamilies: readonly QualifiedLocalFamily[] = [
    "CIVIC_METABOLISM",
    "WORLD_SUBSTRATE",
  ]
  const covered = new Set(candidate.coveredFamilies)
  if (!requiredFamilies.every(family => covered.has(family))) {
    reasons.push("COLLIDING_FAMILIES_NOT_FULLY_IN_SCOPE")
  }
  if (!candidate.deterministicRuleId) {
    reasons.push("DETERMINISTIC_RULE_ID_MISSING")
  }
  if (!candidate.version) {
    reasons.push("VERSION_MISSING")
  }
  if (!candidate.provenanceRecordId) {
    reasons.push("PROVENANCE_RECORD_MISSING")
  }

  return {
    candidateId: candidate.candidateId,
    admitted: reasons.length === 0,
    reasons,
  }
}

export function runHigherScopeResolutionAdmission001():
  HigherScopeResolutionAdmissionResult {
  const source: SameKeyCollisionHoldResult =
    runSameKeyCollisionHold001()
  const sourceQualificationHashBefore =
    hashSameKeyCollisionHold001(source)

  const candidates: readonly ResolutionAuthorityCandidate[] = [
    {
      candidateId: "AUTH-CAND-LOCAL-FAMILY-001",
      candidateType: "LOCAL_FAMILY_SELF_AUTHORITY",
      issuerId: "CIVIC_METABOLISM",
      issuerIsLocalFamily: true,
      coveredKey: "FIXTURE.SHARED_LOCAL_STATE_KEY",
      coveredFamilies: ["CIVIC_METABOLISM", "WORLD_SUBSTRATE"],
      deterministicRuleId: "LOCAL-SELF-WINNER-001",
      version: "v0.1",
      provenanceRecordId: "FIXTURE-PROV-LOCAL-001",
    },
    {
      candidateId: "AUTH-CAND-HIGHER-SCOPE-INCOMPLETE-001",
      candidateType: "HIGHER_SCOPE_RULE_CANDIDATE",
      issuerId: "FIXTURE.HIGHER_SCOPE_POLICY_LAYER",
      issuerIsLocalFamily: false,
      coveredKey: "FIXTURE.SHARED_LOCAL_STATE_KEY",
      coveredFamilies: ["CIVIC_METABOLISM", "WORLD_SUBSTRATE"],
      deterministicRuleId: null,
      version: "v0.1",
      provenanceRecordId: "FIXTURE-PROV-HIGHER-001",
    },
  ]

  const admissions = candidates.map(evaluateCandidate)
  const admittedCandidateIds = admissions
    .filter(admission => admission.admitted)
    .map(admission => admission.candidateId)

  const historyCountBefore = source.historyCountAfter
  const historyCountAfter = source.historyCountAfter
  const sourceQualificationHashAfter =
    hashSameKeyCollisionHold001(source)

  return {
    schema: HIGHER_SCOPE_RESOLUTION_ADMISSION_SCHEMA,
    sourceQualificationHashBefore,
    sourceQualificationHashAfter,
    collisionDispositionBefore: source.disposition,
    candidates,
    admissions,
    admittedCandidateIds,
    resolutionApplied: false,
    winnerProposalId: null,
    mergeApplied: false,
    stateCommitApplied: false,
    finalDisposition: "HOLD_UNRESOLVED",
    authorityLawStatus: "AWAITING_QUALIFIED_HIGHER_SCOPE_RULE",
    historyCountBefore,
    historyCountAfter,
  }
}

export function canonicalHigherScopeResolutionAdmission001(
  result: HigherScopeResolutionAdmissionResult,
): string {
  return JSON.stringify(result)
}

export function hashHigherScopeResolutionAdmission001(
  result: HigherScopeResolutionAdmissionResult,
): string {
  return createHash("sha256")
    .update(canonicalHigherScopeResolutionAdmission001(result))
    .digest("hex")
}

export function validateHigherScopeResolutionAdmission001(
  result: HigherScopeResolutionAdmissionResult,
): readonly string[] {
  const errors: string[] = []

  if (result.candidates.length !== 2) {
    errors.push("EXPECTED_TWO_AUTHORITY_CANDIDATES")
  }
  if (result.admittedCandidateIds.length !== 0) {
    errors.push("UNQUALIFIED_RESOLUTION_AUTHORITY_ADMITTED")
  }
  if (
    !result.admissions.some(
      admission =>
        admission.candidateId === "AUTH-CAND-LOCAL-FAMILY-001" &&
        admission.reasons.includes(
          "LOCAL_FAMILY_CANNOT_AUTHOR_PEER_RESOLUTION_AUTHORITY",
        ),
    )
  ) {
    errors.push("LOCAL_FAMILY_SELF_AUTHORITY_NOT_REJECTED")
  }
  if (
    !result.admissions.some(
      admission =>
        admission.candidateId ===
          "AUTH-CAND-HIGHER-SCOPE-INCOMPLETE-001" &&
        admission.reasons.includes("DETERMINISTIC_RULE_ID_MISSING"),
    )
  ) {
    errors.push("INCOMPLETE_HIGHER_SCOPE_RULE_NOT_REJECTED")
  }
  if (result.resolutionApplied) {
    errors.push("UNQUALIFIED_RESOLUTION_APPLIED")
  }
  if (result.winnerProposalId !== null) {
    errors.push("WINNER_INVENTED_WITHOUT_QUALIFIED_AUTHORITY")
  }
  if (result.mergeApplied) {
    errors.push("MERGE_INVENTED_WITHOUT_QUALIFIED_AUTHORITY")
  }
  if (result.stateCommitApplied) {
    errors.push("STATE_COMMIT_APPLIED_WITHOUT_QUALIFIED_AUTHORITY")
  }
  if (result.finalDisposition !== "HOLD_UNRESOLVED") {
    errors.push("COLLISION_MUST_REMAIN_HELD")
  }
  if (
    result.authorityLawStatus !==
    "AWAITING_QUALIFIED_HIGHER_SCOPE_RULE"
  ) {
    errors.push("AUTHORITY_LAW_STATUS_CHANGED")
  }
  if (result.historyCountBefore !== result.historyCountAfter) {
    errors.push("AUTHORITY_ADMISSION_MUTATED_HISTORY")
  }
  if (
    result.sourceQualificationHashBefore !==
    result.sourceQualificationHashAfter
  ) {
    errors.push("QUALIFIED_ACC007_SOURCE_MUTATED")
  }

  return errors
}
