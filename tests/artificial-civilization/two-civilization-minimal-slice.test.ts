import { describe, expect, it } from "vitest"
import {
  ACCQ_002_SCHEMA,
  canonicalAccq002,
  hashAccq002,
  runAccq002MinimalSlice,
  validateAccq002,
} from "../../src/artificial-civilization/two-civilization-minimal-slice.js"

describe("ACCQ-002 — Two-Civilization Minimal Slice Qualification", () => {
  it("executes the exact cross-civilization route in order", () => {
    const result = runAccq002MinimalSlice()
    expect(result.schema).toBe(ACCQ_002_SCHEMA)
    expect(result.trace.map(x => x.stage)).toEqual([
      "LOCAL_CONSEQUENCE",
      "COMMITTED_HISTORY",
      "LIVING_WORLD_HEART",
      "NASHATA_OUTBOUND",
      "UNDERFLOW",
      "NASHATA_INBOUND",
      "RECEIVING_WORLD_ADMISSION",
      "LOCAL_RESPONSE",
      "GAMERLASTONE_WITNESS",
    ])
  })

  it("binds both civilizations to the same frozen Pyramid World Container", () => {
    const result = runAccq002MinimalSlice()
    expect(result.worldHashA).toBe(result.worldHashB)
    expect(result.worldHashA).toMatch(/^[a-f0-9]{64}$/)
  })

  it("commits Civilization A history before exposing outward influence", () => {
    const result = runAccq002MinimalSlice()
    expect(result.civilizationA.committedHistory).toHaveLength(1)
    expect(result.packet.originHistoryId).toBe(result.civilizationA.committedHistory[0].id)
    expect(result.trace.findIndex(x => x.stage === "COMMITTED_HISTORY"))
      .toBeLessThan(result.trace.findIndex(x => x.stage === "LIVING_WORLD_HEART"))
  })

  it("transfers no ordinary matter and grants no remote mutation authority", () => {
    const result = runAccq002MinimalSlice()
    expect(result.packet.ordinaryMatterTransferred).toBe(false)
    expect(result.packet.directRemoteMutationPermitted).toBe(false)
  })

  it("makes Civilization B author one local response after admission", () => {
    const result = runAccq002MinimalSlice()
    expect(result.civilizationB.localResponseCount).toBe(1)
    expect(result.civilizationB.committedHistory).toHaveLength(1)
    expect(result.civilizationB.committedHistory[0].sourceRecordId)
      .toBe(result.civilizationA.committedHistory[0].id)
    expect(result.civilizationB.pendingEligibility).toEqual([])
  })

  it("keeps GamerLaStone outside simulation truth and refuses fabricated human witness", () => {
    const result = runAccq002MinimalSlice()
    expect(result.gamerLaStone.simulationTruthEstablished).toBe(true)
    expect(result.gamerLaStone.humanEncounterEstablished).toBe(false)
    expect(result.gamerLaStone.disposition).toBe("SHAKE_NOT_YET_HUMAN_WITNESS")
    expect(result.trace.at(-1)?.stage).toBe("GAMERLASTONE_WITNESS")
  })

  it("preserves Nimveyru + DyroneNim + Nimsaru as non-agentive observation only", () => {
    const result = runAccq002MinimalSlice()
    expect(result.lensRecord).toEqual({
      primary: "NIMVEYRU",
      supports: ["DYRONENIM", "NIMSARU"],
      role: "NON_AGENTIVE_OBSERVATION_ONLY",
    })
  })

  it("validates the baseline fixture with no errors", () => {
    expect(validateAccq002(runAccq002MinimalSlice())).toEqual([])
  })

  it("replays byte-identically with the same SHA-256 result", () => {
    const a = runAccq002MinimalSlice()
    const b = runAccq002MinimalSlice()
    expect(canonicalAccq002(a)).toBe(canonicalAccq002(b))
    expect(hashAccq002(a)).toBe(hashAccq002(b))
  })

  it("keeps source and receiving history reconstructible from the packet", () => {
    const result = runAccq002MinimalSlice()
    const source = result.civilizationA.committedHistory
      .find(x => x.id === result.packet.originHistoryId)
    const response = result.civilizationB.committedHistory
      .find(x => x.sourceRecordId === result.packet.originHistoryId)
    expect(source?.kind).toBe("LOCAL_ECOLOGY_CONSEQUENCE_FIXTURE")
    expect(response?.kind).toBe("LOCAL_CIVIC_METABOLISM_RESPONSE_FIXTURE")
  })
})
