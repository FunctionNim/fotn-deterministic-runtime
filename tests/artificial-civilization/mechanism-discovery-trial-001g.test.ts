import { describe, expect, it } from "vitest"
import {
  canonicalMechanismDiscoveryTrial001G,
  hashMechanismDiscoveryTrial001G,
  runMechanismDiscoveryTrial001G,
  validateMechanismDiscoveryTrial001G,
} from "../../src/artificial-civilization/mechanism-discovery-trial-001g.js"

describe("Mechanism Discovery Trial 001G — history carrier / hysteresis positive control", () => {
  it("uses byte-identical present inputs for fresh and previously exposed histories", () => {
    const result = runMechanismDiscoveryTrial001G()
    expect(result.presentInputsByteIdentical).toBe(true)
    expect(result.presentInputFresh).toEqual(result.presentInputExposed)
  })

  it("changes only the explicit history carrier between conditions", () => {
    const result = runMechanismDiscoveryTrial001G()
    expect(result.historyCarrierOnlyDifference).toBe(true)
    expect(result.freshHistory.priorSharedAbsenceObserved).toBe(false)
    expect(result.exposedHistory.priorSharedAbsenceObserved).toBe(true)
  })

  it("keeps current CM and WS proposal payloads identical across history conditions", () => {
    const result = runMechanismDiscoveryTrial001G()
    expect(result.freshCm.currentProposal)
      .toEqual(result.exposedCm.currentProposal)
    expect(result.freshWs.currentProposal)
      .toEqual(result.exposedWs.currentProposal)
  })

  it("changes CM response form when only prior history differs", () => {
    const result = runMechanismDiscoveryTrial001G()
    expect(result.cmHistoryDependentDifferenceObserved).toBe(true)
    expect(result.freshCm.responseForm).toBe("BASELINE_FORM")
    expect(result.exposedCm.responseForm)
      .toBe("RESIDUE_FORM_AFTER_PRIOR_SHARED_ABSENCE")
  })

  it("changes WS response form when only prior history differs", () => {
    const result = runMechanismDiscoveryTrial001G()
    expect(result.wsHistoryDependentDifferenceObserved).toBe(true)
    expect(result.freshWs.responseForm).toBe("BASELINE_FORM")
    expect(result.exposedWs.responseForm)
      .toBe("RESIDUE_FORM_AFTER_PRIOR_SHARED_ABSENCE")
  })

  it("detects the intended hysteresis positive control", () => {
    const result = runMechanismDiscoveryTrial001G()
    expect(result.positiveControlClassification)
      .toBe("HYSTERESIS_POSITIVE_CONTROL_DETECTED")
  })

  it("does not generalize the synthetic positive control into biological or historical claims", () => {
    const result = runMechanismDiscoveryTrial001G()
    expect(result.biologicalHysteresisClaimPermitted).toBe(false)
    expect(result.historicalArtificialCivilizationHysteresisClaimPermitted)
      .toBe(false)
  })

  it("keeps the collision unresolved with no winner, merge, or state commit", () => {
    const result = runMechanismDiscoveryTrial001G()
    expect(result.disposition).toBe("HOLD_UNRESOLVED")
    expect(result.winnerProposalId).toBeNull()
    expect(result.mergeApplied).toBe(false)
    expect(result.stateCommitApplied).toBe(false)
  })

  it("introduces no scheduler or family authority", () => {
    const result = runMechanismDiscoveryTrial001G()
    expect(result.scheduler).toBe("NONE")
    expect(result.familyAuthority).toBe("NONE")
  })

  it("validates cleanly", () => {
    const result = runMechanismDiscoveryTrial001G()
    expect(validateMechanismDiscoveryTrial001G(result)).toEqual([])
  })

  it("replays byte-identically with the same SHA-256 digest", () => {
    const a = runMechanismDiscoveryTrial001G()
    const b = runMechanismDiscoveryTrial001G()
    expect(canonicalMechanismDiscoveryTrial001G(a))
      .toBe(canonicalMechanismDiscoveryTrial001G(b))
    expect(hashMechanismDiscoveryTrial001G(a))
      .toBe(hashMechanismDiscoveryTrial001G(b))
  })
})
