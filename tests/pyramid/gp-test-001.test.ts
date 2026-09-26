import { describe, expect, it } from "vitest"
import {
  GP_TEST_001,
  activePumpCapacity,
  activeReturnCapacity,
  applyGPCommand,
  canonicalGPState,
  createGPTest001Baseline,
  hashGPState,
  replayGPCommands,
  totalWater,
  type GPCommand,
} from "../../src/pyramid/gp-test-001.js"

describe("GP-TEST-001 — fixture identity", () => {
  it("locks the exact island, land, population, watershed, and system counts", () => {
    const state = createGPTest001Baseline()
    expect(state.fixtureId).toBe("GP-TEST-001")
    expect(state.shellOrder).toBe(3)
    expect(state.islands).toHaveLength(3)
    expect(state.islands.reduce((s, i) => s + i.landKm2, 0)).toBe(10_434)
    expect(state.islands.reduce((s, i) => s + i.residents, 0)).toBe(3_600)
    expect(state.islands.flatMap(i => i.watershedIds)).toHaveLength(9)
    expect(state.anchorFields).toHaveLength(12)
    expect(state.edges).toHaveLength(3)
    expect(state.symbols).toHaveLength(12)
    expect(state.water.pumps).toHaveLength(3)
    expect(state.water.returnZones).toHaveLength(9)
  })

  it("locks exactly 12,000,000 GP-WU with no hidden store", () => {
    const state = createGPTest001Baseline()
    expect(totalWater(state)).toBe(GP_TEST_001.totalWater)
  })
})

describe("GP-TEST-001 — canonical failure suite", () => {
  it("GPF-001 one anchor out remains supported at exact fixture capacity", () => {
    const state = createGPTest001Baseline()
    const field = state.anchorFields[0]
    const result = applyGPCommand(state, {
      type: "ISOLATE_ANCHOR",
      fieldId: field.id,
      anchorId: field.anchors[0].id,
    })
    expect(result.accepted).toBe(true)
    const next = result.state.anchorFields[0]
    expect(next.status).toBe("NORMAL")
    expect(Object.values(next.allocation).reduce((a, b) => a + b, 0)).toBe(1_000)
    expect(Math.max(...Object.values(next.allocation))).toBe(250)
  })

  it("GPF-002 two anchors out requires load transfer", () => {
    let state = createGPTest001Baseline()
    const field = state.anchorFields[0]
    state = applyGPCommand(state, {
      type: "ISOLATE_ANCHOR",
      fieldId: field.id,
      anchorId: field.anchors[0].id,
    }).state
    const result = applyGPCommand(state, {
      type: "ISOLATE_ANCHOR",
      fieldId: field.id,
      anchorId: field.anchors[1].id,
    })
    expect(result.accepted).toBe(true)
    expect(result.state.anchorFields[0].status).toBe("DEGRADED")
    expect(result.state.anchorFields[0].load).toBe(1_000)
  })

  it("GPF-003 one Water pump out preserves normal Water command capacity", () => {
    const result = applyGPCommand(createGPTest001Baseline(), {
      type: "ISOLATE_PUMP", pumpId: "GP-PUMP-01",
    })
    expect(result.accepted).toBe(true)
    expect(activePumpCapacity(result.state)).toBe(12_000)
    expect(activePumpCapacity(result.state)).toBeGreaterThan(GP_TEST_001.normalWaterCommand)
    expect(totalWater(result.state)).toBe(GP_TEST_001.totalWater)
  })
  it("GPF-004 one Water return zone out preserves normal return capacity", () => {
    const result = applyGPCommand(createGPTest001Baseline(), {
      type: "ISOLATE_RETURN_ZONE", returnZoneId: "GP-RETURN-01",
    })
    expect(result.accepted).toBe(true)
    expect(activeReturnCapacity(result.state)).toBe(12_000)
    expect(activeReturnCapacity(result.state)).toBeGreaterThan(GP_TEST_001.normalWaterCommand)
  })

  it("GPF-005 one PlatedGold trunk out preserves critical service and holds ordinary demand", () => {
    const result = applyGPCommand(createGPTest001Baseline(), {
      type: "ISOLATE_TRUNK", edgeId: "GP-EDGE-01", trunk: "A",
    })
    expect(result.accepted).toBe(true)
    expect(result.state.edges[0].served).toBe(600)
    expect(result.state.edges[0].held).toBe(400)
    expect(result.state.edges[0].served).toBeGreaterThanOrEqual(result.state.edges[0].criticalDemand)
  })

  it("GPF-006 one Symbol Sector RED is local", () => {
    const result = applyGPCommand(createGPTest001Baseline(), {
      type: "SET_SYMBOL_RED", sectorId: "GP-SYMBOL-01",
    })
    expect(result.accepted).toBe(true)
    expect(result.state.symbols[0].online).toBe(false)
    expect(result.state.symbols[0].thermalBand).toBe("RED")
    expect(result.state.symbols.slice(1).every(s => s.online)).toBe(true)
  })
  it("GPF-007 resident peak plus return saturation creates 140 TEU AMBER buffer", () => {
    let state = createGPTest001Baseline()
    state = applyGPCommand(state, { type: "SET_RESIDENT_HEAT", units: 600 }).state
    const result = applyGPCommand(state, { type: "THERMAL_TICK" })
    expect(result.accepted).toBe(true)
    expect(result.state.thermal.reused).toBe(600)
    expect(result.state.thermal.returned).toBe(500)
    expect(result.state.thermal.serviceBuffer).toBe(140)
    expect(result.state.thermal.band).toBe("AMBER")
    expect(
      result.state.thermal.reused +
      result.state.thermal.returned +
      result.state.thermal.serviceBuffer,
    ).toBe(1_240)
  })

  it("GPF-008 Water source underflow DENY/HALT preserves Water", () => {
    const initial = createGPTest001Baseline()
    const before = totalWater(initial)
    const result = applyGPCommand(initial, {
      type: "WATER_TRANSFER",
      from: "surface",
      to: "central",
      units: 600_001,
    })
    expect(result.accepted).toBe(false)
    expect(result.failureCode).toBe("WATER_SOURCE_UNDERFLOW")
    expect(totalWater(result.state)).toBe(before)
    expect(result.state.water.surface).toBe(initial.water.surface)
    expect(result.state.water.central).toBe(initial.water.central)
  })
  it("GPF-009 Water destination overflow DENY/HALT has no partial transfer", () => {
    const initial = createGPTest001Baseline()
    const result = applyGPCommand(initial, {
      type: "WATER_TRANSFER",
      from: "ocean",
      to: "central",
      units: 800_001,
    })
    expect(result.accepted).toBe(false)
    expect(result.failureCode).toBe("WATER_DESTINATION_OVERFLOW")
    expect(result.state.water.ocean).toBe(initial.water.ocean)
    expect(result.state.water.central).toBe(initial.water.central)
    expect(totalWater(result.state)).toBe(GP_TEST_001.totalWater)
  })

  it("GPF-010 energy imbalance DENY/HALT preserves energy ledger", () => {
    const initial = createGPTest001Baseline()
    const result = applyGPCommand(initial, {
      type: "ENERGY_TICK",
      energyIn: 999,
      usefulWork: 600,
      storedEnergyDelta: 100,
      heatGenerated: 200,
      energyReturned: 100,
    })
    expect(result.accepted).toBe(false)
    expect(result.failureCode).toBe("ENERGY_IMBALANCE")
    expect(result.state.energy).toEqual(initial.energy)
  })

  it("GPF-011 combined local failure remains bounded and conserves Water", () => {
    const commands: GPCommand[] = [
      {
        type: "ISOLATE_ANCHOR",
        fieldId: "GP-ANCHOR-FIELD-001",
        anchorId: "GP-ANCHOR-FIELD-001-ANCHOR-01",
      },
      { type: "ISOLATE_TRUNK", edgeId: "GP-EDGE-01", trunk: "A" },
      { type: "SET_SYMBOL_RED", sectorId: "GP-SYMBOL-01" },
      { type: "SET_RESIDENT_HEAT", units: 600 },
      { type: "THERMAL_TICK" },
    ]
    const final = replayGPCommands(createGPTest001Baseline(), commands)
    expect(final.anchorFields[0].status).toBe("NORMAL")
    expect(final.edges[0].held).toBe(400)
    expect(final.symbols[0].online).toBe(false)
    expect(final.thermal.band).toBe("AMBER")
    expect(totalWater(final)).toBe(GP_TEST_001.totalWater)
    expect(final.halted).toBe(false)
  })

  it("GPF-012 identical baseline plus commands yields identical state and hash", () => {
    const commands: GPCommand[] = [
      { type: "ISOLATE_PUMP", pumpId: "GP-PUMP-01" },
      { type: "ISOLATE_RETURN_ZONE", returnZoneId: "GP-RETURN-01" },
      { type: "SET_RESIDENT_HEAT", units: 600 },
      { type: "THERMAL_TICK" },
    ]
    const a = replayGPCommands(createGPTest001Baseline(), commands)
    const b = replayGPCommands(createGPTest001Baseline(), commands)
    expect(canonicalGPState(a)).toBe(canonicalGPState(b))
    expect(hashGPState(a)).toBe(hashGPState(b))
  })

  it("GPF-013 reset after valid sequence restores exact baseline hash", () => {
    const baselineHash = hashGPState(createGPTest001Baseline())
    const changed = replayGPCommands(createGPTest001Baseline(), [
      { type: "ISOLATE_PUMP", pumpId: "GP-PUMP-01" },
      { type: "SET_SYMBOL_RED", sectorId: "GP-SYMBOL-01" },
    ])
    expect(hashGPState(changed)).not.toBe(baselineHash)
    const reset = createGPTest001Baseline()
    expect(hashGPState(reset)).toBe(baselineHash)
  })

  it("GPF-014 reset after halted sequence restores exact baseline hash", () => {
    const baseline = createGPTest001Baseline()
    const baselineHash = hashGPState(baseline)
    const halted = replayGPCommands(createGPTest001Baseline(), [
      {
        type: "WATER_TRANSFER",
        from: "surface",
        to: "central",
        units: 600_001,
      },
      { type: "SET_RESIDENT_HEAT", units: 999 },
    ])
    expect(halted.halted).toBe(true)
    expect(hashGPState(halted)).not.toBe(baselineHash)
    expect(hashGPState(createGPTest001Baseline())).toBe(baselineHash)
  })
})

describe("GP-TEST-001 — normal invariants", () => {
  it("normal thermal tick exactly accounts 1,000 TEU", () => {
    const result = applyGPCommand(createGPTest001Baseline(), { type: "THERMAL_TICK" })
    expect(result.state.thermal.reused).toBe(600)
    expect(result.state.thermal.returned).toBe(400)
    expect(result.state.thermal.serviceBuffer).toBe(0)
    expect(result.state.thermal.band).toBe("GREEN")
  })

  it("valid Water transfer conserves exact total Water", () => {
    const initial = createGPTest001Baseline()
    const result = applyGPCommand(initial, {
      type: "WATER_TRANSFER",
      from: "ocean",
      to: "central",
      units: 100_000,
    })
    expect(result.accepted).toBe(true)
    expect(totalWater(result.state)).toBe(GP_TEST_001.totalWater)
  })
})
