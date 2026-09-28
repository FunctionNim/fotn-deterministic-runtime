import { describe, expect, it } from "vitest"
import {
  canonicalMechanismDiscoveryTrial001H,
  hashMechanismDiscoveryTrial001H,
  runMechanismDiscoveryTrial001H,
  validateMechanismDiscoveryTrial001H,
} from "../../src/artificial-civilization/mechanism-discovery-trial-001h.js"

describe("Mechanism Discovery Trial 001H — history carrier ablation / causal necessity", () => {
  it("holds present inputs identical between carrier-enabled and carrier-ablated conditions", () => {
    const result = runMechanismDiscoveryTrial001H()
    expect(result.presentInputsByteIdentical).toBe(true)
    expect(result.carrierEnabled.presentInput)
      .toEqual(result.carrierAblated.presentInput)
  })

  it("holds prior exposure history identical between conditions", () => {
    const result = runMechanismDiscoveryTrial001H()
    expect(result.priorExposureHistoriesByteIdentical).toBe(true)
    expect(result.carrierEnabled.priorExposureHistory)
      .toEqual(result.carrierAblated.priorExposureHistory)
  })

  it("holds current proposal payloads identical between conditions", () => {
    const result = runMechanismDiscoveryTrial001H()
    expect(result.currentProposalPayloadsByteIdentical).toBe(true)
    expect(result.carrierEnabled.cmCurrentProposal)
      .toEqual(result.carrierAblated.cmCurrentProposal)
    expect(result.carrierEnabled.wsCurrentProposal)
      .toEqual(result.carrierAblated.wsCurrentProposal)
  })

  it("isolates carrier effect enabled versus disabled as the only difference", () => {
    const result = runMechanismDiscoveryTrial001H()
    expect(result.onlyCarrierEffectStateDiffers).toBe(true)
    expect(result.carrierEnabled.carrierEffectEnabled).toBe(true)
    expect(result.carrierAblated.carrierEffectEnabled).toBe(false)
  })

  it("shows residue when the explicit carrier effect is enabled", () => {
    const result = runMechanismDiscoveryTrial001H()
    expect(result.residuePresentWithCarrierEnabled).toBe(true)
    expect(result.carrierEnabled.cmResponseForm)
      .toBe("RESIDUE_FORM_AFTER_PRIOR_SHARED_ABSENCE")
    expect(result.carrierEnabled.wsResponseForm)
      .toBe("RESIDUE_FORM_AFTER_PRIOR_SHARED_ABSENCE")
  })

  it("removes residue when the explicit carrier effect is ablated", () => {
    const result = runMechanismDiscoveryTrial001H()
    expect(result.residueAbsentWithCarrierAblated).toBe(true)
    expect(result.carrierAblated.cmResponseForm).toBe("BASELINE_FORM")
    expect(result.carrierAblated.wsResponseForm).toBe("BASELINE_FORM")
  })

  it("qualifies causal necessity of the explicit carrier effect within the synthetic model", () => {
    const result = runMechanismDiscoveryTrial001H()
    expect(result.causalNecessityClassification)
      .toBe(
        "EXPLICIT_HISTORY_CARRIER_EFFECT_CAUSALLY_NECESSARY_FOR_SYNTHETIC_RESIDUE",
      )
  })

  it("does not infer sufficiency, biological memory, or historical memory claims", () => {
    const result = runMechanismDiscoveryTrial001H()
    expect(result.sufficiencyClaimPermitted).toBe(false)
    expect(result.biologicalMemoryClaimPermitted).toBe(false)
    expect(result.historicalArtificialCivilizationMemoryClaimPermitted)
      .toBe(false)
  })

  it("keeps collision safety boundaries unchanged", () => {
    const result = runMechanismDiscoveryTrial001H()
    expect(result.disposition).toBe("HOLD_UNRESOLVED")
    expect(result.winnerProposalId).toBeNull()
    expect(result.mergeApplied).toBe(false)
    expect(result.stateCommitApplied).toBe(false)
    expect(result.familyAuthority).toBe("NONE")
    expect(result.scheduler).toBe("NONE")
  })

  it("validates cleanly", () => {
    const result = runMechanismDiscoveryTrial001H()
    expect(validateMechanismDiscoveryTrial001H(result)).toEqual([])
  })

  it("replays byte-identically with the same SHA-256 digest", () => {
    const a = runMechanismDiscoveryTrial001H()
    const b = runMechanismDiscoveryTrial001H()
    expect(canonicalMechanismDiscoveryTrial001H(a))
      .toBe(canonicalMechanismDiscoveryTrial001H(b))
    expect(hashMechanismDiscoveryTrial001H(a))
      .toBe(hashMechanismDiscoveryTrial001H(b))
  })
})
