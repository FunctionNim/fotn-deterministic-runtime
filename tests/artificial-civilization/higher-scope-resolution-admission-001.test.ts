import { describe, expect, it } from "vitest"
import {
  HIGHER_SCOPE_RESOLUTION_ADMISSION_SCHEMA,
  canonicalHigherScopeResolutionAdmission001,
  hashHigherScopeResolutionAdmission001,
  runHigherScopeResolutionAdmission001,
  validateHigherScopeResolutionAdmission001,
} from "../../src/artificial-civilization/higher-scope-resolution-admission-001.js"

describe("ACCQ-008 — Higher-Scope Resolution Admission 001", () => {
  it("starts from the qualified unresolved same-key collision", () => {
    const result = runHigherScopeResolutionAdmission001()
    expect(result.schema).toBe(HIGHER_SCOPE_RESOLUTION_ADMISSION_SCHEMA)
    expect(result.collisionDispositionBefore).toBe("HOLD_UNRESOLVED")
  })

  it("rejects a local family attempting to author peer-resolution authority", () => {
    const result = runHigherScopeResolutionAdmission001()
    const admission = result.admissions.find(
      item => item.candidateId === "AUTH-CAND-LOCAL-FAMILY-001",
    )

    expect(admission?.admitted).toBe(false)
    expect(admission?.reasons).toContain(
      "LOCAL_FAMILY_CANNOT_AUTHOR_PEER_RESOLUTION_AUTHORITY",
    )
  })

  it("rejects an incomplete higher-scope candidate lacking a deterministic rule", () => {
    const result = runHigherScopeResolutionAdmission001()
    const admission = result.admissions.find(
      item =>
        item.candidateId ===
        "AUTH-CAND-HIGHER-SCOPE-INCOMPLETE-001",
    )

    expect(admission?.admitted).toBe(false)
    expect(admission?.reasons).toContain("DETERMINISTIC_RULE_ID_MISSING")
  })

  it("admits no authority candidate in the current fixture", () => {
    const result = runHigherScopeResolutionAdmission001()
    expect(result.admittedCandidateIds).toEqual([])
  })

  it("keeps winner, merge, and state commit prohibited without admitted authority", () => {
    const result = runHigherScopeResolutionAdmission001()
    expect(result.resolutionApplied).toBe(false)
    expect(result.winnerProposalId).toBeNull()
    expect(result.mergeApplied).toBe(false)
    expect(result.stateCommitApplied).toBe(false)
  })

  it("keeps the collision held pending a qualified higher-scope rule", () => {
    const result = runHigherScopeResolutionAdmission001()
    expect(result.finalDisposition).toBe("HOLD_UNRESOLVED")
    expect(result.authorityLawStatus)
      .toBe("AWAITING_QUALIFIED_HIGHER_SCOPE_RULE")
  })

  it("does not create history or mutate the qualified ACCQ-007 source", () => {
    const result = runHigherScopeResolutionAdmission001()
    expect(result.historyCountAfter).toBe(result.historyCountBefore)
    expect(result.sourceQualificationHashAfter)
      .toBe(result.sourceQualificationHashBefore)
  })

  it("validates cleanly and replays byte-identically", () => {
    const a = runHigherScopeResolutionAdmission001()
    const b = runHigherScopeResolutionAdmission001()

    expect(validateHigherScopeResolutionAdmission001(a)).toEqual([])
    expect(canonicalHigherScopeResolutionAdmission001(a))
      .toBe(canonicalHigherScopeResolutionAdmission001(b))
    expect(hashHigherScopeResolutionAdmission001(a))
      .toBe(hashHigherScopeResolutionAdmission001(b))
  })
})
