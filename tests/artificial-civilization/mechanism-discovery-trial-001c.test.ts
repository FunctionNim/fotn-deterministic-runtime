import { describe, expect, it } from "vitest"
import {
  canonicalMechanismDiscoveryTrial001C,
  hashMechanismDiscoveryTrial001C,
  runMechanismDiscoveryTrial001C,
  validateMechanismDiscoveryTrial001C,
} from "../../src/artificial-civilization/mechanism-discovery-trial-001c.js"

describe("Mechanism Discovery Trial 001C — family-specific perturbation + cross-effect", () => {
  it("changes only the CM proposal when the CM token is perturbed", () => {
    const result = runMechanismDiscoveryTrial001C()
    expect(result.cmPerturbation.cmChanged).toBe(true)
    expect(result.cmPerturbation.wsChanged).toBe(false)
    expect(result.cmPerturbationCrossEffectOnWs).toBe(false)
  })

  it("changes only the WS proposal when the WS token is perturbed", () => {
    const result = runMechanismDiscoveryTrial001C()
    expect(result.wsPerturbation.wsChanged).toBe(true)
    expect(result.wsPerturbation.cmChanged).toBe(false)
    expect(result.wsPerturbationCrossEffectOnCm).toBe(false)
  })

  it("holds the shared token constant in both perturbation trials", () => {
    const result = runMechanismDiscoveryTrial001C()
    expect(result.cmPerturbation.baselineInput.sharedToken)
      .toBe(result.cmPerturbation.perturbedInput.sharedToken)
    expect(result.wsPerturbation.baselineInput.sharedToken)
      .toBe(result.wsPerturbation.perturbedInput.sharedToken)
  })

  it("holds the non-perturbed family token constant", () => {
    const result = runMechanismDiscoveryTrial001C()
    expect(result.cmPerturbation.baselineInput.substrateToken)
      .toBe(result.cmPerturbation.perturbedInput.substrateToken)
    expect(result.wsPerturbation.baselineInput.civicToken)
      .toBe(result.wsPerturbation.perturbedInput.civicToken)
  })

  it("records the perturbed token in the perturbed family proposal", () => {
    const result = runMechanismDiscoveryTrial001C()
    expect(result.cmPerturbation.perturbedCm.observedFamilyToken)
      .toBe("SYNTHETIC_CM_TOKEN_PERTURBED")
    expect(result.wsPerturbation.perturbedWs.observedFamilyToken)
      .toBe("SYNTHETIC_WS_TOKEN_PERTURBED")
  })

  it("preserves the untouched proposal byte-identically", () => {
    const result = runMechanismDiscoveryTrial001C()
    expect(result.cmPerturbation.perturbedWs)
      .toEqual(result.cmPerturbation.baselineWs)
    expect(result.wsPerturbation.perturbedCm)
      .toEqual(result.wsPerturbation.baselineCm)
  })

  it("qualifies perturbation-supported parallelism only", () => {
    const result = runMechanismDiscoveryTrial001C()
    expect(result.relationClassification)
      .toBe("PARALLEL_ONLY_PERTURBATION_SUPPORTED")
  })

  it("keeps the collision unresolved with no authority or commit", () => {
    const result = runMechanismDiscoveryTrial001C()
    expect(result.disposition).toBe("HOLD_UNRESOLVED")
    expect(result.winnerProposalId).toBeNull()
    expect(result.mergeApplied).toBe(false)
    expect(result.stateCommitApplied).toBe(false)
    expect(result.familyAuthority).toBe("NONE")
    expect(result.scheduler).toBe("NONE")
  })

  it("validates cleanly", () => {
    const result = runMechanismDiscoveryTrial001C()
    expect(validateMechanismDiscoveryTrial001C(result)).toEqual([])
  })

  it("replays byte-identically with the same SHA-256 digest", () => {
    const a = runMechanismDiscoveryTrial001C()
    const b = runMechanismDiscoveryTrial001C()
    expect(canonicalMechanismDiscoveryTrial001C(a))
      .toBe(canonicalMechanismDiscoveryTrial001C(b))
    expect(hashMechanismDiscoveryTrial001C(a))
      .toBe(hashMechanismDiscoveryTrial001C(b))
  })
})
