import { describe, expect, it } from "vitest"
import {
  canonicalMechanismDiscoveryTrial001F,
  hashMechanismDiscoveryTrial001F,
  runMechanismDiscoveryTrial001F,
  validateMechanismDiscoveryTrial001F,
} from "../../src/artificial-civilization/mechanism-discovery-trial-001f.js"

describe("Mechanism Discovery Trial 001F — shared-upstream restoration / reversibility", () => {
  it("holds both family-specific tokens constant through baseline, absence, and restoration", () => {
    const result = runMechanismDiscoveryTrial001F()
    expect(result.cmFamilyTokenHeldConstant).toBe(true)
    expect(result.wsFamilyTokenHeldConstant).toBe(true)
  })

  it("restores the shared input to the exact baseline value", () => {
    const result = runMechanismDiscoveryTrial001F()
    expect(result.sharedInputRestored).toBe(true)
    expect(result.observation.restoredInput.sharedToken)
      .toBe(result.observation.baselineInput.sharedToken)
  })

  it("moves both proposals away from baseline during shared-input absence", () => {
    const result = runMechanismDiscoveryTrial001F()
    expect(result.observation.absentCm)
      .not.toEqual(result.observation.baselineCm)
    expect(result.observation.absentWs)
      .not.toEqual(result.observation.baselineWs)
  })

  it("returns the CM proposal byte-identically to baseline after restoration", () => {
    const result = runMechanismDiscoveryTrial001F()
    expect(result.observation.cmReturnedToBaseline).toBe(true)
    expect(result.observation.restoredCm)
      .toEqual(result.observation.baselineCm)
  })

  it("returns the WS proposal byte-identically to baseline after restoration", () => {
    const result = runMechanismDiscoveryTrial001F()
    expect(result.observation.wsReturnedToBaseline).toBe(true)
    expect(result.observation.restoredWs)
      .toEqual(result.observation.baselineWs)
  })

  it("observes no residue in the current stateless synthetic generators", () => {
    const result = runMechanismDiscoveryTrial001F()
    expect(result.observation.residueObserved).toBe(false)
    expect(result.reversibilityClassification)
      .toBe("FULLY_REVERSIBLE_NO_RESIDUE_OBSERVED")
    expect(result.historyMechanismClaimPermitted).toBe(false)
  })

  it("does not infer direct cross-family causality", () => {
    const result = runMechanismDiscoveryTrial001F()
    expect(result.directCmToWsClaimPermitted).toBe(false)
    expect(result.directWsToCmClaimPermitted).toBe(false)
  })

  it("keeps the collision unresolved with no winner, merge, or state commit", () => {
    const result = runMechanismDiscoveryTrial001F()
    expect(result.disposition).toBe("HOLD_UNRESOLVED")
    expect(result.winnerProposalId).toBeNull()
    expect(result.mergeApplied).toBe(false)
    expect(result.stateCommitApplied).toBe(false)
  })

  it("introduces no scheduler or family authority", () => {
    const result = runMechanismDiscoveryTrial001F()
    expect(result.scheduler).toBe("NONE")
    expect(result.familyAuthority).toBe("NONE")
  })

  it("validates cleanly", () => {
    const result = runMechanismDiscoveryTrial001F()
    expect(validateMechanismDiscoveryTrial001F(result)).toEqual([])
  })

  it("replays byte-identically with the same SHA-256 digest", () => {
    const a = runMechanismDiscoveryTrial001F()
    const b = runMechanismDiscoveryTrial001F()
    expect(canonicalMechanismDiscoveryTrial001F(a))
      .toBe(canonicalMechanismDiscoveryTrial001F(b))
    expect(hashMechanismDiscoveryTrial001F(a))
      .toBe(hashMechanismDiscoveryTrial001F(b))
  })
})
