import { describe, expect, it } from "vitest"
import {
  FOUR_FAMILY_LOCAL_COMPOSITION_SCHEMA,
  canonicalFourFamilyLocalComposition001,
  hashFourFamilyLocalComposition001,
  runFourFamilyLocalComposition001,
  validateFourFamilyLocalComposition001,
} from "../../src/artificial-civilization/four-family-local-composition-001.js"

describe("ACCQ-006 — Four-Family Local Composition 001", () => {
  it("recognizes exactly the four qualified local clock families", () => {
    const result = runFourFamilyLocalComposition001()
    expect(result.schema).toBe(FOUR_FAMILY_LOCAL_COMPOSITION_SCHEMA)
    expect(result.orderedFamilies.map(entry => entry.family)).toEqual([
      "CIVIC_METABOLISM",
      "STEWARDSHIP_MEMORY",
      "ADAPTIVE_CONTINUITY",
      "WORLD_SUBSTRATE",
    ])
  })

  it("preserves the committed history order B-HIST-001 through B-HIST-004", () => {
    const result = runFourFamilyLocalComposition001()
    expect(result.orderedFamilies.map(entry => entry.historyId)).toEqual([
      "B-HIST-001",
      "B-HIST-002",
      "B-HIST-003",
      "B-HIST-004",
    ])
  })

  it("preserves local provenance across the composed family chain", () => {
    const result = runFourFamilyLocalComposition001()
    expect(result.orderedFamilies[1]?.sourceHistoryId).toBe("B-HIST-001")
    expect(result.orderedFamilies[2]?.sourceHistoryId).toBe("B-HIST-002")
    expect(result.orderedFamilies[3]?.sourceHistoryId).toBe("B-HIST-003")
  })

  it("introduces no master scheduler and no family authority", () => {
    const result = runFourFamilyLocalComposition001()
    expect(result.scheduler).toBe("NONE")
    expect(result.familyAuthority).toBe("NONE")
  })

  it("preserves exact cadence and same-key composition as HOLD", () => {
    const result = runFourFamilyLocalComposition001()
    expect(result.exactCadenceStatus).toBe("HOLD")
    expect(result.sameKeyCompositionStatus).toBe("HOLD")
  })

  it("does not add a fifth history record merely to prove composition", () => {
    const result = runFourFamilyLocalComposition001()
    expect(result.historyCountAfter).toBe(result.historyCountBefore)
  })

  it("does not mutate the qualified ACCQ-005 source qualification", () => {
    const result = runFourFamilyLocalComposition001()
    expect(result.sourceQualificationHashAfter)
      .toBe(result.sourceQualificationHashBefore)
  })

  it("validates cleanly and replays byte-identically", () => {
    const a = runFourFamilyLocalComposition001()
    const b = runFourFamilyLocalComposition001()

    expect(validateFourFamilyLocalComposition001(a)).toEqual([])
    expect(canonicalFourFamilyLocalComposition001(a))
      .toBe(canonicalFourFamilyLocalComposition001(b))
    expect(hashFourFamilyLocalComposition001(a))
      .toBe(hashFourFamilyLocalComposition001(b))
  })
})
