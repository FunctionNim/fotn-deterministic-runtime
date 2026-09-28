import { describe, expect, it } from "vitest"
import {
  canonicalMechanismDiscoveryTrial001J,
  hashMechanismDiscoveryTrial001J,
  runMechanismDiscoveryTrial001J,
  validateMechanismDiscoveryTrial001J,
} from "../../src/artificial-civilization/mechanism-discovery-trial-001j.js"

describe("Mechanism Discovery Trial 001J — carrier / response-rule decoupling", () => {
  it("holds present inputs identical across rule-enabled and rule-disabled conditions", () => {
    const result = runMechanismDiscoveryTrial001J()
    expect(result.presentInputsByteIdentical).toBe(true)
    expect(result.ruleEnabled.presentInput)
      .toEqual(result.ruleDisabled.presentInput)
  })

  it("keeps the same stored history carrier present in both conditions", () => {
    const result = runMechanismDiscoveryTrial001J()
    expect(result.historyCarriersByteIdentical).toBe(true)
    expect(result.storedHistoryPresentInBothConditions).toBe(true)
    expect(result.ruleEnabled.historyCarrier)
      .toEqual(result.ruleDisabled.historyCarrier)
  })

  it("holds current proposal payloads identical across conditions", () => {
    const result = runMechanismDiscoveryTrial001J()
    expect(result.currentProposalPayloadsByteIdentical).toBe(true)
    expect(result.ruleEnabled.cmCurrentProposal)
      .toEqual(result.ruleDisabled.cmCurrentProposal)
    expect(result.ruleEnabled.wsCurrentProposal)
      .toEqual(result.ruleDisabled.wsCurrentProposal)
  })

  it("isolates response-rule enablement as the only changed mechanism", () => {
    const result = runMechanismDiscoveryTrial001J()
    expect(result.onlyResponseRuleStateDiffers).toBe(true)
    expect(result.ruleEnabled.responseRuleEnabled).toBe(true)
    expect(result.ruleDisabled.responseRuleEnabled).toBe(false)
  })

  it("expresses residue when the response rule is enabled", () => {
    const result = runMechanismDiscoveryTrial001J()
    expect(result.residuePresentWhenRuleEnabled).toBe(true)
    expect(result.ruleEnabled.cmResponseForm)
      .toBe("RESIDUE_FORM_AFTER_PRIOR_SHARED_ABSENCE")
    expect(result.ruleEnabled.wsResponseForm)
      .toBe("RESIDUE_FORM_AFTER_PRIOR_SHARED_ABSENCE")
  })

  it("retains stored history but removes residue expression when the rule is disabled", () => {
    const result = runMechanismDiscoveryTrial001J()
    expect(result.residueAbsentWhenRuleDisabled).toBe(true)
    expect(result.ruleDisabled.historyCarrier.priorSharedAbsenceObserved)
      .toBe(true)
    expect(result.ruleDisabled.cmResponseForm).toBe("BASELINE_FORM")
    expect(result.ruleDisabled.wsResponseForm).toBe("BASELINE_FORM")
  })

  it("qualifies storage and expression as decoupled synthetic mechanisms", () => {
    const result = runMechanismDiscoveryTrial001J()
    expect(result.decouplingClassification)
      .toBe("HISTORY_STORAGE_AND_RESPONSE_EXPRESSION_DECOUPLED")
  })

  it("does not infer storage necessity or real-world memory claims", () => {
    const result = runMechanismDiscoveryTrial001J()
    expect(result.storageNecessityClaimPermitted).toBe(false)
    expect(result.biologicalMemoryClaimPermitted).toBe(false)
    expect(result.historicalArtificialCivilizationMemoryClaimPermitted)
      .toBe(false)
  })

  it("keeps collision safety boundaries unchanged", () => {
    const result = runMechanismDiscoveryTrial001J()
    expect(result.disposition).toBe("HOLD_UNRESOLVED")
    expect(result.winnerProposalId).toBeNull()
    expect(result.mergeApplied).toBe(false)
    expect(result.stateCommitApplied).toBe(false)
    expect(result.familyAuthority).toBe("NONE")
    expect(result.scheduler).toBe("NONE")
  })

  it("validates cleanly", () => {
    const result = runMechanismDiscoveryTrial001J()
    expect(validateMechanismDiscoveryTrial001J(result)).toEqual([])
  })

  it("replays byte-identically with the same SHA-256 digest", () => {
    const a = runMechanismDiscoveryTrial001J()
    const b = runMechanismDiscoveryTrial001J()
    expect(canonicalMechanismDiscoveryTrial001J(a))
      .toBe(canonicalMechanismDiscoveryTrial001J(b))
    expect(hashMechanismDiscoveryTrial001J(a))
      .toBe(hashMechanismDiscoveryTrial001J(b))
  })
})
