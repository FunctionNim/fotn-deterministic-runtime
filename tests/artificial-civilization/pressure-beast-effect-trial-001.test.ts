import { describe, expect, it } from "vitest"
import {
  canonicalPressureBeastEffectTrial001,
  hashPressureBeastEffectTrial001,
  runPressureBeastEffectTrial001,
  validatePressureBeastEffectTrial001,
} from "../../src/artificial-civilization/pressure-beast-effect-trial-001.js"

describe("Pressure Beast Effect Trial 001 — Brumebeast × stored-history interpretation", () => {
  it("holds present inputs identical across baseline, pressure, and return", () => {
    const result = runPressureBeastEffectTrial001()
    expect(result.presentInputsByteIdenticalAcrossPhases).toBe(true)
  })

  it("preserves the stored history carrier byte-identically under pressure", () => {
    const result = runPressureBeastEffectTrial001()
    expect(result.historyCarrierByteIdenticalAcrossPhases).toBe(true)
    expect(result.storageMutatedByPressure).toBe(false)
  })

  it("holds current CM and WS proposal payloads identical", () => {
    const result = runPressureBeastEffectTrial001()
    expect(result.currentProposalPayloadsByteIdenticalAcrossPhases)
      .toBe(true)
  })

  it("applies the source-backed Brumebeast pressure identity", () => {
    const result = runPressureBeastEffectTrial001()
    expect(result.pressured.pressure).toEqual({
      beastId: "BEAST-014",
      canonicalName: "Brumebeast",
      pressureFunction: "Obscured Structure / Interpretive Drift",
      active: true,
    })
  })

  it("changes interpretation rather than storage under Brumebeast pressure", () => {
    const result = runPressureBeastEffectTrial001()
    expect(result.interpretationChangedUnderPressure).toBe(true)
    expect(result.pressured.interpretationState)
      .toBe("STRUCTURE_OBSCURED_VERIFICATION_REQUIRED")
  })

  it("holds residue expression pending verification without inferring absence", () => {
    const result = runPressureBeastEffectTrial001()
    expect(result.expressionHeldWithoutAbsenceInference).toBe(true)
    expect(result.pressured.expressionState)
      .toBe("RESIDUE_HELD_PENDING_RELATION_VERIFICATION")
    expect(result.pressured.absenceInferencePermitted).toBe(false)
    expect(result.pressured.verificationTarget)
      .toBe("BOUNDARY_OR_SOURCE_OR_ROUTE_OR_SIGNAL")
  })

  it("restores readable interpretation after pressure removal without carrier rewrite", () => {
    const result = runPressureBeastEffectTrial001()
    expect(result.interpretationRecoveredAfterPressureRemoval)
      .toBe(true)
    expect(result.returned.historyCarrier)
      .toEqual(result.baseline.historyCarrier)
    expect(result.returned.expressionState).toBe("RESIDUE_EXPRESSED")
  })

  it("qualifies only the bounded synthetic interpretation effect", () => {
    const result = runPressureBeastEffectTrial001()
    expect(result.qualification)
      .toBe(
        "BRUMEBEAST_INTERPRETATION_PRESSURE_WITH_STORAGE_PRESERVED",
      )
    expect(result.sourceBoundary)
      .toBe("SYNTHETIC_INTERACTION_CONTROL_NOT_BEAST_RUNTIME_OR_WORLD_CANON")
  })

  it("does not infer biological, historical, or Beast runtime claims", () => {
    const result = runPressureBeastEffectTrial001()
    expect(result.biologicalMemoryClaimPermitted).toBe(false)
    expect(result.historicalArtificialCivilizationMemoryClaimPermitted)
      .toBe(false)
    expect(result.beastRuntimeClaimPermitted).toBe(false)
  })

  it("keeps collision safety boundaries unchanged", () => {
    const result = runPressureBeastEffectTrial001()
    expect(result.disposition).toBe("HOLD_UNRESOLVED")
    expect(result.winnerProposalId).toBeNull()
    expect(result.mergeApplied).toBe(false)
    expect(result.stateCommitApplied).toBe(false)
    expect(result.familyAuthority).toBe("NONE")
    expect(result.scheduler).toBe("NONE")
  })

  it("validates cleanly and replays deterministically", () => {
    const a = runPressureBeastEffectTrial001()
    const b = runPressureBeastEffectTrial001()
    expect(validatePressureBeastEffectTrial001(a)).toEqual([])
    expect(canonicalPressureBeastEffectTrial001(a))
      .toBe(canonicalPressureBeastEffectTrial001(b))
    expect(hashPressureBeastEffectTrial001(a))
      .toBe(hashPressureBeastEffectTrial001(b))
  })
})
