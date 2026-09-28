import { describe, expect, it } from "vitest"
import {
  canonicalMechanismDiscoveryTrial001E,
  hashMechanismDiscoveryTrial001E,
  runMechanismDiscoveryTrial001E,
  validateMechanismDiscoveryTrial001E,
} from "../../src/artificial-civilization/mechanism-discovery-trial-001e.js"

describe("Mechanism Discovery Trial 001E — shared-upstream removal / necessity", () => {
  it("removes only the shared input while holding both family tokens constant", () => {
    const result = runMechanismDiscoveryTrial001E()
    expect(result.sharedInputRemoved).toBe(true)
    expect(result.cmFamilyTokenHeldConstant).toBe(true)
    expect(result.wsFamilyTokenHeldConstant).toBe(true)
  })

  it("still generates the CM proposal when the shared input is absent", () => {
    const result = runMechanismDiscoveryTrial001E()
    expect(result.observation.cmGeneratedWithSharedAbsent).toBe(true)
    expect(result.observation.absentSharedCm.observedFamilyToken)
      .toBe("SYNTHETIC_CM_TOKEN")
  })

  it("still generates the WS proposal when the shared input is absent", () => {
    const result = runMechanismDiscoveryTrial001E()
    expect(result.observation.wsGeneratedWithSharedAbsent).toBe(true)
    expect(result.observation.absentSharedWs.observedFamilyToken)
      .toBe("SYNTHETIC_WS_TOKEN")
  })

  it("changes both proposals because their observed shared state changes", () => {
    const result = runMechanismDiscoveryTrial001E()
    expect(result.observation.cmChanged).toBe(true)
    expect(result.observation.wsChanged).toBe(true)
    expect(result.observation.absentSharedCm.observedSharedToken)
      .toBe("SYNTHETIC_SHARED_TOKEN_ABSENT")
    expect(result.observation.absentSharedWs.observedSharedToken)
      .toBe("SYNTHETIC_SHARED_TOKEN_ABSENT")
  })

  it("qualifies shared input as a modulator rather than a generation prerequisite", () => {
    const result = runMechanismDiscoveryTrial001E()
    expect(result.proposalGenerationNecessity)
      .toBe("SHARED_INPUT_NOT_REQUIRED_FOR_PROPOSAL_GENERATION")
    expect(result.sharedDependentStateNecessity)
      .toBe("SHARED_INPUT_REQUIRED_FOR_BASELINE_SHARED_STATE")
    expect(result.relationClassification)
      .toBe("COMMON_UPSTREAM_MODULATOR_NOT_GENERATION_PREREQUISITE")
  })

  it("does not infer direct CM to WS or WS to CM causality", () => {
    const result = runMechanismDiscoveryTrial001E()
    expect(result.directCmToWsClaimPermitted).toBe(false)
    expect(result.directWsToCmClaimPermitted).toBe(false)
  })

  it("keeps the collision unresolved with no winner, merge, or state commit", () => {
    const result = runMechanismDiscoveryTrial001E()
    expect(result.disposition).toBe("HOLD_UNRESOLVED")
    expect(result.winnerProposalId).toBeNull()
    expect(result.mergeApplied).toBe(false)
    expect(result.stateCommitApplied).toBe(false)
  })

  it("introduces no scheduler or family authority", () => {
    const result = runMechanismDiscoveryTrial001E()
    expect(result.scheduler).toBe("NONE")
    expect(result.familyAuthority).toBe("NONE")
  })

  it("validates cleanly", () => {
    const result = runMechanismDiscoveryTrial001E()
    expect(validateMechanismDiscoveryTrial001E(result)).toEqual([])
  })

  it("replays byte-identically with the same SHA-256 digest", () => {
    const a = runMechanismDiscoveryTrial001E()
    const b = runMechanismDiscoveryTrial001E()
    expect(canonicalMechanismDiscoveryTrial001E(a))
      .toBe(canonicalMechanismDiscoveryTrial001E(b))
    expect(hashMechanismDiscoveryTrial001E(a))
      .toBe(hashMechanismDiscoveryTrial001E(b))
  })
})
