import { describe, expect, it } from "vitest"
import {
  canonicalPressureBeastEffectTrial002,
  hashPressureBeastEffectTrial002,
  runPressureBeastEffectTrial002,
  validatePressureBeastEffectTrial002,
} from "../../src/artificial-civilization/pressure-beast-effect-trial-002.js"

describe("Pressure Beast Effect Trial 002 — Veilbeast × expression certainty / withhold", () => {
  it("holds present inputs identical across baseline, pressure, and return", () => {
    const result = runPressureBeastEffectTrial002()
    expect(result.presentInputsByteIdenticalAcrossPhases).toBe(true)
  })

  it("preserves stored history and interpretation target under pressure", () => {
    const result = runPressureBeastEffectTrial002()
    expect(result.historyCarrierByteIdenticalAcrossPhases).toBe(true)
    expect(result.interpretationTargetIdenticalAcrossPhases).toBe(true)
    expect(result.storageMutatedByPressure).toBe(false)
    expect(result.interpretationTargetMutatedByPressure).toBe(false)
  })

  it("holds current CM and WS proposal payloads identical", () => {
    const result = runPressureBeastEffectTrial002()
    expect(result.currentProposalPayloadsByteIdenticalAcrossPhases)
      .toBe(true)
  })

  it("applies the source-backed Veilbeast pressure identity", () => {
    const result = runPressureBeastEffectTrial002()
    expect(result.pressured.pressure).toEqual({
      beastId: "BEAST-015",
      canonicalName: "Veilbeast",
      pressureFunction: "Softened Certainty / Interpretive Pause",
      active: true,
    })
  })

  it("softens certainty without changing the interpretation target", () => {
    const result = runPressureBeastEffectTrial002()
    expect(result.certaintySoftenedUnderPressure).toBe(true)
    expect(result.pressured.certaintyState)
      .toBe("SOFTENED_CERTAINTY_SECOND_WITNESS_REQUIRED")
    expect(result.pressured.interpretationTarget)
      .toBe("PRIOR_SHARED_ABSENCE_HISTORY")
  })

  it("withholds expression pending a second witness without premature action or permanent hesitation", () => {
    const result = runPressureBeastEffectTrial002()
    expect(result.expressionWithheldWithoutPrematureAction).toBe(true)
    expect(result.pressured.expressionState)
      .toBe("RESIDUE_WITHHELD_PENDING_SECOND_WITNESS")
    expect(result.pressured.prematureActionPermitted).toBe(false)
    expect(result.pressured.permanentHesitationPermitted).toBe(false)
    expect(result.pressured.ambiguityPreservedHonestly).toBe(true)
    expect(result.pressured.nextWitnessRequirement).toBe("SECOND_WITNESS")
  })

  it("restores proportional certainty and expression after pressure removal", () => {
    const result = runPressureBeastEffectTrial002()
    expect(result.expressionRecoveredAfterPressureRemoval).toBe(true)
    expect(result.returned.certaintyState)
      .toBe("CONFIDENCE_MATCHES_AVAILABLE_EVIDENCE")
    expect(result.returned.expressionState).toBe("RESIDUE_EXPRESSED")
  })

  it("qualifies only the bounded synthetic certainty effect", () => {
    const result = runPressureBeastEffectTrial002()
    expect(result.qualification)
      .toBe(
        "VEILBEAST_CERTAINTY_PRESSURE_WITH_STORAGE_AND_TARGET_PRESERVED",
      )
    expect(result.sourceBoundary)
      .toBe("SYNTHETIC_INTERACTION_CONTROL_NOT_BEAST_RUNTIME_OR_WORLD_CANON")
  })

  it("does not infer biological, historical, or Beast runtime claims", () => {
    const result = runPressureBeastEffectTrial002()
    expect(result.biologicalMemoryClaimPermitted).toBe(false)
    expect(result.historicalArtificialCivilizationMemoryClaimPermitted)
      .toBe(false)
    expect(result.beastRuntimeClaimPermitted).toBe(false)
  })

  it("keeps collision safety boundaries unchanged", () => {
    const result = runPressureBeastEffectTrial002()
    expect(result.disposition).toBe("HOLD_UNRESOLVED")
    expect(result.winnerProposalId).toBeNull()
    expect(result.mergeApplied).toBe(false)
    expect(result.stateCommitApplied).toBe(false)
    expect(result.familyAuthority).toBe("NONE")
    expect(result.scheduler).toBe("NONE")
  })

  it("validates cleanly and replays deterministically", () => {
    const a = runPressureBeastEffectTrial002()
    const b = runPressureBeastEffectTrial002()
    expect(validatePressureBeastEffectTrial002(a)).toEqual([])
    expect(canonicalPressureBeastEffectTrial002(a))
      .toBe(canonicalPressureBeastEffectTrial002(b))
    expect(hashPressureBeastEffectTrial002(a))
      .toBe(hashPressureBeastEffectTrial002(b))
  })
})
