import { describe, expect, it } from "vitest"
import {
  GAMERLASTONE_APERTURE_SCHEMA,
  createApertureTrialFixture,
} from "../../src/gamerlastone/aperture-trial-001.js"

describe("GamerLaStone Aperture Trial 001", () => {
  it("builds a human-readable aperture from the committed ACCQ-002 history", () => {
    const { aperture } = createApertureTrialFixture()
    expect(aperture.schema).toBe(GAMERLASTONE_APERTURE_SCHEMA)
    expect(aperture.cards).toHaveLength(5)
    expect(aperture.title).toContain("without the civilizations touching")
  })

  it("does not mutate the underlying simulation", () => {
    const { beforeHash, afterHash } = createApertureTrialFixture()
    expect(afterHash).toBe(beforeHash)
  })

  it("makes the causal origin readable", () => {
    const { aperture, markdown } = createApertureTrialFixture()
    expect(aperture.causalStatement).toContain("Civilization A")
    expect(aperture.causalStatement).toContain("Civilization B")
    expect(markdown).toContain("A-HIST-001 → PKT-A-B-001 → B-HIST-001")
  })

  it("makes the no-physical-contact boundary explicit", () => {
    const { markdown } = createApertureTrialFixture()
    expect(markdown).toContain("No Citizen, object, resource, or ordinary matter crossed")
    expect(markdown).toContain("never physically touched")
  })

  it("makes local authorship in Civilization B explicit", () => {
    const { markdown } = createApertureTrialFixture()
    expect(markdown).toContain("authored its own local carrying-capacity review")
    expect(markdown).toContain("did not choose the receiving civilization's response")
  })

  it("keeps GamerLaStone human witness unclaimed", () => {
    const { aperture } = createApertureTrialFixture()
    expect(aperture.witnessStatus).toBe("AWAITING_HUMAN_WITNESS")
    expect(aperture.boundaryStatement).toContain("Human encounter is not established")
  })

  it("ends with a direct witness question rather than an automated verdict", () => {
    const { aperture } = createApertureTrialFixture()
    expect(aperture.witnessPrompt).toBe(
      "After reading this, can you tell that Civilization B's change was caused by an influence originating in Civilization A, even though the civilizations never physically touched?",
    )
  })

  it("renders deterministically", () => {
    const a = createApertureTrialFixture()
    const b = createApertureTrialFixture()
    expect(a.markdown).toBe(b.markdown)
    expect(a.aperture).toEqual(b.aperture)
  })
})
