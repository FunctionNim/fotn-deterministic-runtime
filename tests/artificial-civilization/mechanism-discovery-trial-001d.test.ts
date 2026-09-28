import { describe, expect, it } from "vitest"
import {
  canonicalMechanismDiscoveryTrial001D,
  hashMechanismDiscoveryTrial001D,
  runMechanismDiscoveryTrial001D,
  validateMechanismDiscoveryTrial001D,
} from "../../src/artificial-civilization/mechanism-discovery-trial-001d.js"

describe("Mechanism Discovery Trial 001D — shared-upstream perturbation + common-cause", () => {
  it("changes only the shared token while holding both family tokens constant", () => {
    const result = runMechanismDiscoveryTrial001D()
    expect(result.sharedTokenChanged).toBe(true)
    expect(result.cmFamilyTokenHeldConstant).toBe(true)
    expect(result.wsFamilyTokenHeldConstant).toBe(true)
  })

  it("changes the CM proposal in response to the shared-token perturbation", () => {
    const result = runMechanismDiscoveryTrial001D()
    expect(result.observation.cmChanged).toBe(true)
    expect(result.observation.perturbedCm.observedSharedToken)
      .toBe("SYNTHETIC_SHARED_TOKEN_PERTURBED")
  })

  it("changes the WS proposal in response to the shared-token perturbation", () => {
    const result = runMechanismDiscoveryTrial001D()
    expect(result.observation.wsChanged).toBe(true)
    expect(result.observation.perturbedWs.observedSharedToken)
      .toBe("SYNTHETIC_SHARED_TOKEN_PERTURBED")
  })

  it("records a shared upstream response without inferring direct CM to WS causality", () => {
    const result = runMechanismDiscoveryTrial001D()
    expect(result.bothFamiliesResponded).toBe(true)
    expect(result.directCmToWsClaimPermitted).toBe(false)
    expect(result.directWsToCmClaimPermitted).toBe(false)
    expect(result.relationClassification)
      .toBe("COMMON_UPSTREAM_RESPONSE_SUPPORTED")
  })

  it("keeps family-specific tokens byte-identical across the shared perturbation", () => {
    const result = runMechanismDiscoveryTrial001D()
    expect(result.observation.baselineCm.observedFamilyToken)
      .toBe(result.observation.perturbedCm.observedFamilyToken)
    expect(result.observation.baselineWs.observedFamilyToken)
      .toBe(result.observation.perturbedWs.observedFamilyToken)
  })

  it("keeps the collision unresolved with no winner, merge, or state commit", () => {
    const result = runMechanismDiscoveryTrial001D()
    expect(result.disposition).toBe("HOLD_UNRESOLVED")
    expect(result.winnerProposalId).toBeNull()
    expect(result.mergeApplied).toBe(false)
    expect(result.stateCommitApplied).toBe(false)
  })

  it("introduces no scheduler or family authority", () => {
    const result = runMechanismDiscoveryTrial001D()
    expect(result.scheduler).toBe("NONE")
    expect(result.familyAuthority).toBe("NONE")
  })

  it("validates cleanly", () => {
    const result = runMechanismDiscoveryTrial001D()
    expect(validateMechanismDiscoveryTrial001D(result)).toEqual([])
  })

  it("replays byte-identically with the same SHA-256 digest", () => {
    const a = runMechanismDiscoveryTrial001D()
    const b = runMechanismDiscoveryTrial001D()
    expect(canonicalMechanismDiscoveryTrial001D(a))
      .toBe(canonicalMechanismDiscoveryTrial001D(b))
    expect(hashMechanismDiscoveryTrial001D(a))
      .toBe(hashMechanismDiscoveryTrial001D(b))
  })
})
