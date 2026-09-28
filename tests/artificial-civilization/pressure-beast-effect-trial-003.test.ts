import { describe, expect, it } from "vitest"
import {
  canonicalPressureBeastEffectTrial003,
  hashPressureBeastEffectTrial003,
  runPressureBeastEffectTrial003,
  validatePressureBeastEffectTrial003,
} from "../../src/artificial-civilization/pressure-beast-effect-trial-003.js"

describe("Pressure Beast Effect Trial 003 — Dambeast × stored-history access / outlet control", () => {
  it("holds present inputs identical across baseline, pressure, and return", () => {
    const result = runPressureBeastEffectTrial003()
    expect(result.presentInputsByteIdenticalAcrossPhases).toBe(true)
  })

  it("preserves stored history, interpretation target, and certainty state", () => {
    const result = runPressureBeastEffectTrial003()
    expect(result.historyCarrierByteIdenticalAcrossPhases).toBe(true)
    expect(result.interpretationTargetIdenticalAcrossPhases).toBe(true)
    expect(result.certaintyStateIdenticalAcrossPhases).toBe(true)
    expect(result.storageMutatedByPressure).toBe(false)
  })

  it("holds current CM and WS proposal payloads identical", () => {
    const result = runPressureBeastEffectTrial003()
    expect(result.currentProposalPayloadsByteIdenticalAcrossPhases)
      .toBe(true)
  })

  it("applies the source-backed Dambeast pressure identity", () => {
    const result = runPressureBeastEffectTrial003()
    expect(result.pressured.pressure).toEqual({
      beastId: "BEAST-012",
      canonicalName: "Dambeast",
      pressureFunction: "Local Tending / Outlet Control",
      active: true,
    })
  })

  it("restricts reader access without deleting the stored history", () => {
    const result = runPressureBeastEffectTrial003()
    expect(result.accessRestrictedUnderPressure).toBe(true)
    expect(result.pressured.storageState).toBe("HISTORY_STORED_INTACT")
    expect(result.pressured.readerAccessState)
      .toBe("LOCAL_OUTLET_CONTROL_RESTRICTS_READER_ACCESS")
    expect(result.pressured.readerCanAccessStoredHistory).toBe(false)
  })

  it("withholds expression because of the access gate without inferring deletion", () => {
    const result = runPressureBeastEffectTrial003()
    expect(
      result.expressionWithheldByAccessGateWithoutDeletionInference,
    ).toBe(true)
    expect(result.pressured.expressionState)
      .toBe("RESIDUE_WITHHELD_BY_ACCESS_GATE")
    expect(result.pressured.deletionInferencePermitted).toBe(false)
    expect(result.pressured.exchangeRepairRequirement)
      .toBe("OPEN_MEASURED_EXCHANGE_AND_RESTORE_USABLE_ACCESS")
  })

  it("restores usable access and expression after pressure removal", () => {
    const result = runPressureBeastEffectTrial003()
    expect(result.usableAccessRecoveredAfterPressureRemoval).toBe(true)
    expect(result.returned.readerAccessState).toBe("USABLE_ACCESS_OPEN")
    expect(result.returned.readerCanAccessStoredHistory).toBe(true)
    expect(result.returned.expressionState).toBe("RESIDUE_EXPRESSED")
  })

  it("qualifies only the bounded synthetic access-gating effect", () => {
    const result = runPressureBeastEffectTrial003()
    expect(result.qualification)
      .toBe(
        "DAMBEAST_ACCESS_PRESSURE_WITH_STORAGE_CERTAINTY_AND_TARGET_PRESERVED",
      )
    expect(result.sourceBoundary)
      .toBe("SYNTHETIC_INTERACTION_CONTROL_NOT_BEAST_RUNTIME_OR_WORLD_CANON")
  })

  it("does not infer biological, historical, or Beast runtime claims", () => {
    const result = runPressureBeastEffectTrial003()
    expect(result.biologicalMemoryClaimPermitted).toBe(false)
    expect(result.historicalArtificialCivilizationMemoryClaimPermitted)
      .toBe(false)
    expect(result.beastRuntimeClaimPermitted).toBe(false)
  })

  it("keeps collision safety boundaries unchanged", () => {
    const result = runPressureBeastEffectTrial003()
    expect(result.disposition).toBe("HOLD_UNRESOLVED")
    expect(result.winnerProposalId).toBeNull()
    expect(result.mergeApplied).toBe(false)
    expect(result.stateCommitApplied).toBe(false)
    expect(result.familyAuthority).toBe("NONE")
    expect(result.scheduler).toBe("NONE")
  })

  it("validates cleanly and replays deterministically", () => {
    const a = runPressureBeastEffectTrial003()
    const b = runPressureBeastEffectTrial003()
    expect(validatePressureBeastEffectTrial003(a)).toEqual([])
    expect(canonicalPressureBeastEffectTrial003(a))
      .toBe(canonicalPressureBeastEffectTrial003(b))
    expect(hashPressureBeastEffectTrial003(a))
      .toBe(hashPressureBeastEffectTrial003(b))
  })
})
