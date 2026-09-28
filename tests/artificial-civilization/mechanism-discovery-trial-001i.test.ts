import { describe, expect, it } from "vitest"
import {
  canonicalMechanismDiscoveryTrial001I,
  hashMechanismDiscoveryTrial001I,
  runMechanismDiscoveryTrial001I,
  validateMechanismDiscoveryTrial001I,
} from "../../src/artificial-civilization/mechanism-discovery-trial-001i.js"

describe("Mechanism Discovery Trial 001I — history carrier sufficiency / minimal cause", () => {
  it("holds present inputs identical between no-carrier and carrier-introduced conditions", () => {
    const result = runMechanismDiscoveryTrial001I()
    expect(result.presentInputsByteIdentical).toBe(true)
    expect(result.noCarrierBaseline.presentInput)
      .toEqual(result.carrierIntroduced.presentInput)
  })

  it("holds current proposal payloads identical between conditions", () => {
    const result = runMechanismDiscoveryTrial001I()
    expect(result.currentProposalPayloadsByteIdentical).toBe(true)
    expect(result.noCarrierBaseline.cmCurrentProposal)
      .toEqual(result.carrierIntroduced.cmCurrentProposal)
    expect(result.noCarrierBaseline.wsCurrentProposal)
      .toEqual(result.carrierIntroduced.wsCurrentProposal)
  })

  it("starts with no residue when no history carrier is present", () => {
    const result = runMechanismDiscoveryTrial001I()
    expect(result.residueAbsentWithoutCarrier).toBe(true)
    expect(result.noCarrierBaseline.cmResponseForm).toBe("BASELINE_FORM")
    expect(result.noCarrierBaseline.wsResponseForm).toBe("BASELINE_FORM")
  })

  it("isolates carrier introduction plus enabled effect as the changed mechanism", () => {
    const result = runMechanismDiscoveryTrial001I()
    expect(result.carrierIntroductionOnlyDifference).toBe(true)
    expect(result.noCarrierBaseline.historyCarrier).toBeNull()
    expect(result.carrierIntroduced.historyCarrier).not.toBeNull()
    expect(result.carrierIntroduced.carrierEffectEnabled).toBe(true)
  })

  it("produces residue after introducing the enabled carrier with defined prior exposure", () => {
    const result = runMechanismDiscoveryTrial001I()
    expect(result.residuePresentAfterCarrierIntroduction).toBe(true)
    expect(result.carrierIntroduced.cmResponseForm)
      .toBe("RESIDUE_FORM_AFTER_PRIOR_SHARED_ABSENCE")
    expect(result.carrierIntroduced.wsResponseForm)
      .toBe("RESIDUE_FORM_AFTER_PRIOR_SHARED_ABSENCE")
  })

  it("qualifies sufficiency only within the synthetic mechanism", () => {
    const result = runMechanismDiscoveryTrial001I()
    expect(result.sufficiencyClassification)
      .toBe(
        "EXPLICIT_HISTORY_CARRIER_WITH_DEFINED_PRIOR_EXPOSURE_SUFFICIENT_FOR_SYNTHETIC_RESIDUE",
      )
  })

  it("preserves the prior necessity result as a separate finding", () => {
    const result = runMechanismDiscoveryTrial001I()
    expect(result.necessityResultPreserved).toBe(true)
  })

  it("does not generalize into biological or historical memory claims", () => {
    const result = runMechanismDiscoveryTrial001I()
    expect(result.biologicalMemoryClaimPermitted).toBe(false)
    expect(result.historicalArtificialCivilizationMemoryClaimPermitted)
      .toBe(false)
  })

  it("keeps collision safety boundaries unchanged", () => {
    const result = runMechanismDiscoveryTrial001I()
    expect(result.disposition).toBe("HOLD_UNRESOLVED")
    expect(result.winnerProposalId).toBeNull()
    expect(result.mergeApplied).toBe(false)
    expect(result.stateCommitApplied).toBe(false)
    expect(result.familyAuthority).toBe("NONE")
    expect(result.scheduler).toBe("NONE")
  })

  it("validates cleanly", () => {
    const result = runMechanismDiscoveryTrial001I()
    expect(validateMechanismDiscoveryTrial001I(result)).toEqual([])
  })

  it("replays byte-identically with the same SHA-256 digest", () => {
    const a = runMechanismDiscoveryTrial001I()
    const b = runMechanismDiscoveryTrial001I()
    expect(canonicalMechanismDiscoveryTrial001I(a))
      .toBe(canonicalMechanismDiscoveryTrial001I(b))
    expect(hashMechanismDiscoveryTrial001I(a))
      .toBe(hashMechanismDiscoveryTrial001I(b))
  })
})
