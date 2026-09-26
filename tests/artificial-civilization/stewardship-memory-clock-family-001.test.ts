import { describe, expect, it } from "vitest"
import {
  STEWARDSHIP_MEMORY_CLOCK_SCHEMA,
  canonicalStewardshipMemoryClock001,
  hashStewardshipMemoryClock001,
  runStewardshipMemoryClockFamily001,
  validateStewardshipMemoryClock001,
} from "../../src/artificial-civilization/stewardship-memory-clock-family-001.js"

describe("ACCQ-003 — Stewardship / Memory Clock Family 001", () => {
  it("adds exactly one additional clock family", () => {
    const result = runStewardshipMemoryClockFamily001()
    expect(result.schema).toBe(STEWARDSHIP_MEMORY_CLOCK_SCHEMA)
    expect(result.additionalFamilies).toHaveLength(1)
    expect(result.additionalFamilies[0]?.family).toBe("STEWARDSHIP_MEMORY")
  })

  it("preserves exact cadence as HOLD", () => {
    const result = runStewardshipMemoryClockFamily001()
    expect(result.additionalFamilies[0]?.exactCadenceStatus).toBe("HOLD")
  })

  it("runs only after Civilization B has committed its own local response", () => {
    const result = runStewardshipMemoryClockFamily001()
    const prior = result.civilizationB.committedHistory
      .find(record => record.id === "B-HIST-001")
    const memory = result.civilizationB.committedHistory
      .find(record => record.id === "B-HIST-002")

    expect(prior).toBeDefined()
    expect(memory?.sourceRecordId).toBe(prior?.id)
    expect(memory?.localCycle).toBe((prior?.localCycle ?? 0) + 1)
  })

  it("preserves local authorship instead of bypassing to Civilization A", () => {
    const result = runStewardshipMemoryClockFamily001()
    const memory = result.civilizationB.committedHistory
      .find(record => record.id === "B-HIST-002")

    expect(memory?.kind).toBe("LOCAL_STEWARDSHIP_MEMORY_RESPONSE_FIXTURE")
    expect(memory?.sourceRecordId).toBe("B-HIST-001")
    expect(memory?.sourceRecordId).not.toBe("A-HIST-001")
  })

  it("does not mutate the qualified ACCQ-002 source simulation", () => {
    const result = runStewardshipMemoryClockFamily001()
    expect(result.sourceSimulationHashAfter)
      .toBe(result.sourceSimulationHashBefore)
  })

  it("validates with no errors", () => {
    expect(
      validateStewardshipMemoryClock001(
        runStewardshipMemoryClockFamily001(),
      ),
    ).toEqual([])
  })

  it("replays byte-identically", () => {
    const a = runStewardshipMemoryClockFamily001()
    const b = runStewardshipMemoryClockFamily001()
    expect(canonicalStewardshipMemoryClock001(a))
      .toBe(canonicalStewardshipMemoryClock001(b))
    expect(hashStewardshipMemoryClock001(a))
      .toBe(hashStewardshipMemoryClock001(b))
  })
})
