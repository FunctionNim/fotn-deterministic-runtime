import { describe, expect, it } from "vitest"
import {
  ADAPTIVE_CONTINUITY_CLOCK_SCHEMA,
  canonicalAdaptiveContinuityClock001,
  hashAdaptiveContinuityClock001,
  runAdaptiveContinuityClockFamily001,
  validateAdaptiveContinuityClock001,
} from "../../src/artificial-civilization/adaptive-continuity-clock-family-001.js"

describe("ACCQ-004 — Adaptive Continuity Clock Family 001", () => {
  it("adds exactly one adaptive continuity clock family", () => {
    const result = runAdaptiveContinuityClockFamily001()
    expect(result.schema).toBe(ADAPTIVE_CONTINUITY_CLOCK_SCHEMA)
    expect(result.additionalFamilies).toHaveLength(1)
    expect(result.additionalFamilies[0]?.family).toBe("ADAPTIVE_CONTINUITY")
  })

  it("preserves exact cadence as HOLD", () => {
    const result = runAdaptiveContinuityClockFamily001()
    expect(result.additionalFamilies[0]?.exactCadenceStatus).toBe("HOLD")
  })

  it("becomes eligible only from committed local memory", () => {
    const result = runAdaptiveContinuityClockFamily001()
    const memory = result.civilizationB.committedHistory
      .find(record => record.id === "B-HIST-002")
    const adaptation = result.civilizationB.committedHistory
      .find(record => record.id === "B-HIST-003")

    expect(memory).toBeDefined()
    expect(result.additionalFamilies[0]?.eligibilityBasis)
      .toBe("PRIOR_LOCAL_MEMORY_COMMITTED")
    expect(adaptation?.sourceRecordId).toBe(memory?.id)
  })

  it("preserves the local causal chain B-HIST-001 to B-HIST-002 to B-HIST-003", () => {
    const result = runAdaptiveContinuityClockFamily001()
    const metabolism = result.civilizationB.committedHistory
      .find(record => record.id === "B-HIST-001")
    const memory = result.civilizationB.committedHistory
      .find(record => record.id === "B-HIST-002")
    const adaptation = result.civilizationB.committedHistory
      .find(record => record.id === "B-HIST-003")

    expect(memory?.sourceRecordId).toBe(metabolism?.id)
    expect(adaptation?.sourceRecordId).toBe(memory?.id)
  })

  it("does not bypass memory to Civilization A or the earlier metabolism record", () => {
    const result = runAdaptiveContinuityClockFamily001()
    const adaptation = result.civilizationB.committedHistory
      .find(record => record.id === "B-HIST-003")

    expect(adaptation?.kind).toBe("LOCAL_ADAPTIVE_CONTINUITY_RESPONSE_FIXTURE")
    expect(adaptation?.sourceRecordId).toBe("B-HIST-002")
    expect(adaptation?.sourceRecordId).not.toBe("B-HIST-001")
    expect(adaptation?.sourceRecordId).not.toBe("A-HIST-001")
  })

  it("preserves deterministic local ordering without defining real-world cadence", () => {
    const result = runAdaptiveContinuityClockFamily001()
    const memory = result.civilizationB.committedHistory
      .find(record => record.id === "B-HIST-002")
    const adaptation = result.civilizationB.committedHistory
      .find(record => record.id === "B-HIST-003")

    expect(adaptation?.localCycle).toBe((memory?.localCycle ?? 0) + 1)
    expect(result.additionalFamilies[0]?.exactCadenceStatus).toBe("HOLD")
  })

  it("does not mutate the qualified ACCQ-003 source qualification", () => {
    const result = runAdaptiveContinuityClockFamily001()
    expect(result.sourceQualificationHashAfter)
      .toBe(result.sourceQualificationHashBefore)
  })

  it("validates with no errors and replays byte-identically", () => {
    const a = runAdaptiveContinuityClockFamily001()
    const b = runAdaptiveContinuityClockFamily001()

    expect(validateAdaptiveContinuityClock001(a)).toEqual([])
    expect(canonicalAdaptiveContinuityClock001(a))
      .toBe(canonicalAdaptiveContinuityClock001(b))
    expect(hashAdaptiveContinuityClock001(a))
      .toBe(hashAdaptiveContinuityClock001(b))
  })
})
