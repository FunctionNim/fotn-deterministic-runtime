import { describe, expect, it } from "vitest"
import {
  WORLD_SUBSTRATE_CLOCK_SCHEMA,
  canonicalWorldSubstrateClock001,
  hashWorldSubstrateClock001,
  runWorldSubstrateClockFamily001,
  validateWorldSubstrateClock001,
} from "../../src/artificial-civilization/world-substrate-clock-family-001.js"

describe("ACCQ-005 — World / Substrate Clock Family 001", () => {
  it("adds exactly one world/substrate clock family", () => {
    const result = runWorldSubstrateClockFamily001()
    expect(result.schema).toBe(WORLD_SUBSTRATE_CLOCK_SCHEMA)
    expect(result.additionalFamilies).toHaveLength(1)
    expect(result.additionalFamilies[0]?.family).toBe("WORLD_SUBSTRATE")
  })

  it("preserves exact cadence as HOLD", () => {
    const result = runWorldSubstrateClockFamily001()
    expect(result.additionalFamilies[0]?.exactCadenceStatus).toBe("HOLD")
  })

  it("becomes eligible only from committed local adaptation", () => {
    const result = runWorldSubstrateClockFamily001()
    const adaptation = result.civilizationB.committedHistory
      .find(record => record.id === "B-HIST-003")
    const substrate = result.civilizationB.committedHistory
      .find(record => record.id === "B-HIST-004")

    expect(adaptation).toBeDefined()
    expect(result.additionalFamilies[0]?.eligibilityBasis)
      .toBe("PRIOR_LOCAL_ADAPTATION_COMMITTED")
    expect(substrate?.sourceRecordId).toBe(adaptation?.id)
  })

  it("preserves the full local causal chain through B-HIST-004", () => {
    const result = runWorldSubstrateClockFamily001()
    const h1 = result.civilizationB.committedHistory.find(r => r.id === "B-HIST-001")
    const h2 = result.civilizationB.committedHistory.find(r => r.id === "B-HIST-002")
    const h3 = result.civilizationB.committedHistory.find(r => r.id === "B-HIST-003")
    const h4 = result.civilizationB.committedHistory.find(r => r.id === "B-HIST-004")

    expect(h2?.sourceRecordId).toBe(h1?.id)
    expect(h3?.sourceRecordId).toBe(h2?.id)
    expect(h4?.sourceRecordId).toBe(h3?.id)
  })

  it("does not bypass adaptive continuity to an earlier record or Civilization A", () => {
    const result = runWorldSubstrateClockFamily001()
    const substrate = result.civilizationB.committedHistory
      .find(record => record.id === "B-HIST-004")

    expect(substrate?.kind).toBe("LOCAL_WORLD_SUBSTRATE_RESPONSE_FIXTURE")
    expect(substrate?.sourceRecordId).toBe("B-HIST-003")
    expect(substrate?.sourceRecordId).not.toBe("B-HIST-002")
    expect(substrate?.sourceRecordId).not.toBe("B-HIST-001")
    expect(substrate?.sourceRecordId).not.toBe("A-HIST-001")
  })

  it("preserves deterministic local ordering without claiming real-world cadence", () => {
    const result = runWorldSubstrateClockFamily001()
    const adaptation = result.civilizationB.committedHistory
      .find(record => record.id === "B-HIST-003")
    const substrate = result.civilizationB.committedHistory
      .find(record => record.id === "B-HIST-004")

    expect(substrate?.localCycle).toBe((adaptation?.localCycle ?? 0) + 1)
    expect(result.additionalFamilies[0]?.exactCadenceStatus).toBe("HOLD")
  })

  it("does not mutate the qualified ACCQ-004 source qualification", () => {
    const result = runWorldSubstrateClockFamily001()
    expect(result.sourceQualificationHashAfter)
      .toBe(result.sourceQualificationHashBefore)
  })

  it("validates with no errors and replays byte-identically", () => {
    const a = runWorldSubstrateClockFamily001()
    const b = runWorldSubstrateClockFamily001()

    expect(validateWorldSubstrateClock001(a)).toEqual([])
    expect(canonicalWorldSubstrateClock001(a))
      .toBe(canonicalWorldSubstrateClock001(b))
    expect(hashWorldSubstrateClock001(a))
      .toBe(hashWorldSubstrateClock001(b))
  })
})
