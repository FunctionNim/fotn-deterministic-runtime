import { describe, expect, it } from "vitest"
import {
  canonicalMechanismDiscoveryTrial001K,
  hashMechanismDiscoveryTrial001K,
  runMechanismDiscoveryTrial001K,
  validateMechanismDiscoveryTrial001K,
} from "../../src/artificial-civilization/mechanism-discovery-trial-001k.js"

describe("Mechanism Discovery Trial 001K — dormant history / reactivation", () => {
  it("keeps present inputs identical across dormant and reactivated cycles", () => {
    const result = runMechanismDiscoveryTrial001K()
    expect(result.presentInputsByteIdenticalAcrossCycles).toBe(true)
  })

  it("keeps the stored history carrier byte-identical across all cycles", () => {
    const result = runMechanismDiscoveryTrial001K()
    expect(result.historyCarrierByteIdenticalAcrossCycles).toBe(true)
    expect(result.dormantCycle1.historyCarrier)
      .toEqual(result.reactivatedCycle.historyCarrier)
  })

  it("keeps current proposal payloads identical across all cycles", () => {
    const result = runMechanismDiscoveryTrial001K()
    expect(result.currentProposalPayloadsByteIdenticalAcrossCycles)
      .toBe(true)
  })

  it("preserves stored history while expression is disabled for multiple cycles", () => {
    const result = runMechanismDiscoveryTrial001K()
    expect(result.dormancyPreservedWithoutExpression).toBe(true)
    expect(result.dormantCycle1.responseRuleEnabled).toBe(false)
    expect(result.dormantCycle2.responseRuleEnabled).toBe(false)
  })

  it("shows no residue during dormant cycles", () => {
    const result = runMechanismDiscoveryTrial001K()
    expect(result.residueAbsentDuringDormancy).toBe(true)
    expect(result.dormantCycle1.cmResponseForm).toBe("BASELINE_FORM")
    expect(result.dormantCycle2.wsResponseForm).toBe("BASELINE_FORM")
  })

  it("returns residue after response-rule reactivation without rewriting history", () => {
    const result = runMechanismDiscoveryTrial001K()
    expect(result.residueReturnedAfterRuleReactivation).toBe(true)
    expect(result.reactivatedCycle.cmResponseForm)
      .toBe("RESIDUE_FORM_AFTER_PRIOR_SHARED_ABSENCE")
    expect(result.reactivatedCycle.wsResponseForm)
      .toBe("RESIDUE_FORM_AFTER_PRIOR_SHARED_ABSENCE")
  })

  it("qualifies dormant history as preserved and reactivatable", () => {
    const result = runMechanismDiscoveryTrial001K()
    expect(result.reactivationClassification)
      .toBe("DORMANT_HISTORY_PRESERVED_AND_REACTIVATABLE")
  })

  it("does not generalize into biological or historical memory claims", () => {
    const result = runMechanismDiscoveryTrial001K()
    expect(result.biologicalMemoryClaimPermitted).toBe(false)
    expect(result.historicalArtificialCivilizationMemoryClaimPermitted)
      .toBe(false)
  })

  it("keeps collision safety boundaries unchanged", () => {
    const result = runMechanismDiscoveryTrial001K()
    expect(result.disposition).toBe("HOLD_UNRESOLVED")
    expect(result.winnerProposalId).toBeNull()
    expect(result.mergeApplied).toBe(false)
    expect(result.stateCommitApplied).toBe(false)
    expect(result.familyAuthority).toBe("NONE")
    expect(result.scheduler).toBe("NONE")
  })

  it("validates cleanly", () => {
    const result = runMechanismDiscoveryTrial001K()
    expect(validateMechanismDiscoveryTrial001K(result)).toEqual([])
  })

  it("replays byte-identically with the same SHA-256 digest", () => {
    const a = runMechanismDiscoveryTrial001K()
    const b = runMechanismDiscoveryTrial001K()
    expect(canonicalMechanismDiscoveryTrial001K(a))
      .toBe(canonicalMechanismDiscoveryTrial001K(b))
    expect(hashMechanismDiscoveryTrial001K(a))
      .toBe(hashMechanismDiscoveryTrial001K(b))
  })
})
