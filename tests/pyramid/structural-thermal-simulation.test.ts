import { describe, expect, it } from "vitest"
import {
  BOTTOM_SYSTEMS,
  SIM,
  THERMAL_MAPPING,
  allocateInteger,
  applySimulationCommand,
  canonicalSimulationState,
  createBaselineSimulation,
  hashSimulationState,
  replaySimulation,
  totalThermalAccounted,
  type SimulationCommand,
} from "../../src/pyramid/structural-thermal-simulation.js"

describe("IMPLEMENTATION SIMULATION RUNBOOK 001 — baseline identity", () => {
  it("creates 120 Land Anchor Fields and 60 Symbol Sectors", () => {
    const state = createBaselineSimulation(5)
    expect(state.fields).toHaveLength(120)
    expect(state.symbolSectors).toHaveLength(60)
    expect(state.fields[0].id).toBe("land-anchor-field-001")
    expect(state.fields[119].id).toBe("land-anchor-field-120")
  })

  it("preserves the exact four-class thermal mapping", () => {
    expect(THERMAL_MAPPING).toEqual({
      HOLD: "RESIDENT_HEAT",
      RELATE: "ENVIRONMENTAL_HEAT",
      UNDERSTAND: "SERVICE_HEAT",
      BECOME: "SYSTEM_HEAT",
      RETURN: "CARRIES_REMAINDER",
    })
  })

  it.each([3, 4, 5] as const)("Shell-%i creates one dual-trunk edge per side", shell => {
    const state = createBaselineSimulation(shell)
    expect(state.edges).toHaveLength(shell)
    expect(state.edges.every(e => e.trunkA.active && e.trunkB.active)).toBe(true)
  })
})

describe("structural load fixtures", () => {
  it("STR-001 conserves each field load across anchor allocations", () => {
    const state = createBaselineSimulation()
    for (const field of state.fields) {
      const total = Object.values(field.allocation).reduce((a, b) => a + b, 0)
      expect(total).toBe(field.load)
    }
  })

  it("STR-002 quotient/remainder allocation is deterministic by stable ID", () => {
    const result = allocateInteger(10, ["c", "a", "b"], 4)
    expect(result).toEqual({ a: 4, b: 3, c: 3 })
  })

  it("STR-003 one anchor out redistributes exactly and remains normal at capacity", () => {
    const initial = createBaselineSimulation()
    const field = initial.fields[0]
    const result = applySimulationCommand(initial, {
      type: "ISOLATE_ANCHOR",
      fieldId: field.id,
      anchorId: field.anchors[0].id,
    })
    expect(result.accepted).toBe(true)
    const next = result.state.fields[0]
    expect(next.status).toBe("NORMAL")
    expect(Object.values(next.allocation).reduce((a, b) => a + b, 0)).toBe(SIM.fieldLoad)
    expect(Math.max(...Object.values(next.allocation))).toBe(SIM.anchorCapacity)
  })

  it("STR-003 second anchor loss enters degraded state without deleting field load", () => {
    const initial = createBaselineSimulation()
    const field = initial.fields[0]
    const one = applySimulationCommand(initial, {
      type: "ISOLATE_ANCHOR", fieldId: field.id, anchorId: field.anchors[0].id,
    }).state
    const two = applySimulationCommand(one, {
      type: "ISOLATE_ANCHOR", fieldId: field.id, anchorId: field.anchors[1].id,
    })
    expect(two.accepted).toBe(true)
    expect(two.state.fields[0].status).toBe("DEGRADED")
    expect(two.state.fields[0].load).toBe(SIM.fieldLoad)
  })

  it("STR-004 denies field isolation before adequate load transfer", () => {
    const initial = createBaselineSimulation()
    const result = applySimulationCommand(initial, {
      type: "ISOLATE_FIELD",
      fieldId: initial.fields[0].id,
      transferCapacity: SIM.fieldLoad - 1,
    })
    expect(result.accepted).toBe(false)
    expect(result.failureCode).toBe("LOAD_TRANSFER_INSUFFICIENT")
    expect(result.state.fields[0].status).toBe("NORMAL")
  })

  it("STR-004 permits isolation after adequate transfer capacity is registered", () => {
    const initial = createBaselineSimulation()
    const result = applySimulationCommand(initial, {
      type: "ISOLATE_FIELD",
      fieldId: initial.fields[0].id,
      transferCapacity: SIM.fieldLoad,
    })
    expect(result.accepted).toBe(true)
    expect(result.state.fields[0].status).toBe("ISOLATED")
  })

  it("STR-006 bottom-system registry keeps Gravity Bed distinct from support/service systems", () => {
    expect(BOTTOM_SYSTEMS).toContain("GRAVITY_BED")
    expect(BOTTOM_SYSTEMS).toContain("LAND_ANCHOR_INTERFACE")
    expect(BOTTOM_SYSTEMS).toContain("BEARING_FORGE_PATH")
    expect(new Set(BOTTOM_SYSTEMS).size).toBe(BOTTOM_SYSTEMS.length)
  })
})

describe("PlatedGold and Symbol fixtures", () => {
  it("PWR-002 one trunk out preserves critical load and holds excess demand", () => {
    const initial = createBaselineSimulation(5)
    const result = applySimulationCommand(initial, {
      type: "ISOLATE_TRUNK",
      edgeId: "edge-01",
      trunk: "A",
    })
    expect(result.accepted).toBe(true)
    const edge = result.state.edges[0]
    expect(edge.served).toBe(SIM.trunkCapacity)
    expect(edge.held).toBe(SIM.edgeDemand - SIM.trunkCapacity)
    expect(edge.served).toBeGreaterThanOrEqual(edge.criticalDemand)
  })

  it("restoring a trunk restores full served demand without inventing demand", () => {
    const initial = createBaselineSimulation(5)
    const degraded = applySimulationCommand(initial, {
      type: "ISOLATE_TRUNK", edgeId: "edge-01", trunk: "A",
    }).state
    const restored = applySimulationCommand(degraded, {
      type: "RESTORE_TRUNK", edgeId: "edge-01", trunk: "A",
    })
    expect(restored.state.edges[0].served).toBe(SIM.edgeDemand)
    expect(restored.state.edges[0].held).toBe(0)
  })

  it("PWR-003 one Relay Node can be isolated independently", () => {
    const initial = createBaselineSimulation()
    const result = applySimulationCommand(initial, {
      type: "ISOLATE_RELAY", relayId: "relay-001",
    })
    expect(result.accepted).toBe(true)
    expect(result.state.relays.find(r => r.id === "relay-001")?.active).toBe(false)
    expect(result.state.relays.find(r => r.id === "relay-002")?.active).toBe(true)
  })

  it("SYM-001 every Symbol Sector has two distinct feeds", () => {
    const state = createBaselineSimulation()
    expect(state.symbolSectors.every(s => s.feedRelayIds[0] !== s.feedRelayIds[1])).toBe(true)
  })

  it("SYM-002 one Symbol Sector offline does not change its neighbors", () => {
    const initial = createBaselineSimulation()
    const result = applySimulationCommand(initial, {
      type: "SET_SYMBOL_OFFLINE", sectorId: "symbol-sector-001",
    })
    expect(result.state.symbolSectors[0].online).toBe(false)
    expect(result.state.symbolSectors[1].online).toBe(true)
  })

  it("RED thermal state takes only the affected Symbol Sector offline", () => {
    const initial = createBaselineSimulation()
    const result = applySimulationCommand(initial, {
      type: "SET_SYMBOL_THERMAL", sectorId: "symbol-sector-010", band: "RED",
    })
    expect(result.state.symbolSectors[9].thermalBand).toBe("RED")
    expect(result.state.symbolSectors[9].online).toBe(false)
    expect(result.state.symbolSectors[8].online).toBe(true)
  })
})

describe("four-class thermal fixtures", () => {
  it("THM-001/002 higher activity input produces higher Resident Heat", () => {
    const low = applySimulationCommand(createBaselineSimulation(), {
      type: "ADD_RESIDENT_HEAT", units: 100,
    }).state
    const high = applySimulationCommand(createBaselineSimulation(), {
      type: "ADD_RESIDENT_HEAT", units: 300,
    }).state
    expect(high.thermal.resident).toBeGreaterThan(low.thermal.resident)
  })

  it("THM-003 Environmental Heat is separate from Resident and System Heat", () => {
    const result = applySimulationCommand(createBaselineSimulation(), {
      type: "ADD_ENVIRONMENTAL_HEAT", units: 125,
    })
    expect(result.state.thermal.environmental).toBe(125)
    expect(result.state.thermal.resident).toBe(0)
    expect(result.state.thermal.system).toBe(0)
  })

  it("THM-004 System Heat is accounted explicitly", () => {
    const result = applySimulationCommand(createBaselineSimulation(), {
      type: "ADD_SYSTEM_HEAT", units: 90,
    })
    expect(result.state.thermal.system).toBe(90)
  })

  it("THM-005 collection moves source heat into Service Heat exactly once", () => {
    let state = createBaselineSimulation()
    state = applySimulationCommand(state, { type: "ADD_RESIDENT_HEAT", units: 100 }).state
    state = applySimulationCommand(state, { type: "ADD_ENVIRONMENTAL_HEAT", units: 200 }).state
    state = applySimulationCommand(state, { type: "ADD_SYSTEM_HEAT", units: 300 }).state
    const before = totalThermalAccounted(state.thermal)
    state = applySimulationCommand(state, { type: "COLLECT_HEAT" }).state
    expect(state.thermal.service).toBe(600)
    expect(state.thermal.resident + state.thermal.environmental + state.thermal.system).toBe(0)
    expect(totalThermalAccounted(state.thermal)).toBe(before)
  })

  it("THM-006 reuse transfers Service Heat without loss", () => {
    let state = createBaselineSimulation()
    state = applySimulationCommand(state, { type: "ADD_SYSTEM_HEAT", units: 500 }).state
    state = applySimulationCommand(state, { type: "COLLECT_HEAT" }).state
    const before = totalThermalAccounted(state.thermal)
    state = applySimulationCommand(state, { type: "REUSE_SERVICE_HEAT", units: 200 }).state
    expect(state.thermal.service).toBe(300)
    expect(state.thermal.reused).toBe(200)
    expect(totalThermalAccounted(state.thermal)).toBe(before)
  })
  it("THM-007/008 below and exact return capacity conserve TEU", () => {
    for (const units of [500, SIM.thermalReturnCapacity]) {
      let state = createBaselineSimulation()
      state = applySimulationCommand(state, { type: "ADD_SYSTEM_HEAT", units }).state
      state = applySimulationCommand(state, { type: "COLLECT_HEAT" }).state
      const before = totalThermalAccounted(state.thermal)
      state = applySimulationCommand(state, { type: "RETURN_SERVICE_HEAT", units }).state
      expect(state.thermal.returned).toBe(units)
      expect(totalThermalAccounted(state.thermal)).toBe(before)
    }
  })

  it("THM-009 caps over-capacity return and leaves excess as Service Heat", () => {
    let state = createBaselineSimulation()
    state = applySimulationCommand(state, {
      type: "ADD_SYSTEM_HEAT", units: SIM.thermalReturnCapacity + 250,
    }).state
    state = applySimulationCommand(state, { type: "COLLECT_HEAT" }).state
    const before = totalThermalAccounted(state.thermal)
    state = applySimulationCommand(state, {
      type: "RETURN_SERVICE_HEAT", units: SIM.thermalReturnCapacity + 250,
    }).state
    expect(state.thermal.returned).toBe(SIM.thermalReturnCapacity)
    expect(state.thermal.service).toBe(250)
    expect(totalThermalAccounted(state.thermal)).toBe(before)
  })
  it("denies Service Heat underflow before authoritative mutation", () => {
    const initial = createBaselineSimulation()
    const before = canonicalSimulationState(initial)
    const result = applySimulationCommand(initial, {
      type: "REUSE_SERVICE_HEAT", units: 1,
    })
    expect(result.accepted).toBe(false)
    expect(result.failureCode).toBe("SERVICE_HEAT_UNDERFLOW")
    const sanitized = structuredClone(result.state)
    sanitized.halted = false
    sanitized.failureCode = null
    expect(canonicalSimulationState(sanitized)).toBe(before)
  })
})

describe("energy conservation fixtures", () => {
  it("accepts an exactly balanced normalized energy tick", () => {
    const result = applySimulationCommand(createBaselineSimulation(), {
      type: "ENERGY_TICK",
      energyIn: 1_000,
      usefulWork: 600,
      storedEnergyDelta: 100,
      heatGenerated: 200,
      energyReturned: 100,
    })
    expect(result.accepted).toBe(true)
    expect(result.state.energy.energyIn).toBe(1_000)
    expect(result.state.thermal.system).toBe(200)
  })

  it("DENY/HALT rejects an imbalanced energy tick without authoritative mutation", () => {
    const initial = createBaselineSimulation()
    const result = applySimulationCommand(initial, {
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
    expect(result.state.thermal).toEqual(initial.thermal)
  })
})

describe("combined failure, replay, and reset fixtures", () => {
  const commands: SimulationCommand[] = [
    { type: "ISOLATE_ANCHOR", fieldId: "land-anchor-field-001", anchorId: "land-anchor-field-001-anchor-01" },
    { type: "ISOLATE_TRUNK", edgeId: "edge-01", trunk: "A" },
    { type: "SET_SYMBOL_THERMAL", sectorId: "symbol-sector-001", band: "RED" },
    { type: "ADD_RESIDENT_HEAT", units: 400 },
    { type: "ADD_ENVIRONMENTAL_HEAT", units: 200 },
    { type: "ADD_SYSTEM_HEAT", units: 700 },
    { type: "COLLECT_HEAT" },
    { type: "REUSE_SERVICE_HEAT", units: 200 },
    { type: "RETURN_SERVICE_HEAT", units: 1_100 },
  ]

  it("combined bounded failures preserve independent structural, power, and thermal state", () => {
    const final = replaySimulation(createBaselineSimulation(5), commands)
    expect(final.fields[0].status).toBe("NORMAL")
    expect(final.edges[0].held).toBe(400)
    expect(final.symbolSectors[0].online).toBe(false)
    expect(final.thermal.returned).toBe(SIM.thermalReturnCapacity)
    expect(final.thermal.service).toBe(100)
  })

  it("identical initial state + commands produce identical canonical state and hash", () => {
    const a = replaySimulation(createBaselineSimulation(5), commands)
    const b = replaySimulation(createBaselineSimulation(5), commands)
    expect(canonicalSimulationState(a)).toBe(canonicalSimulationState(b))
    expect(hashSimulationState(a)).toBe(hashSimulationState(b))
  })

  it("reconstructing the baseline restores its exact hash", () => {
    const baselineHash = hashSimulationState(createBaselineSimulation(5))
    const changed = replaySimulation(createBaselineSimulation(5), commands)
    expect(hashSimulationState(changed)).not.toBe(baselineHash)
    expect(hashSimulationState(createBaselineSimulation(5))).toBe(baselineHash)
  })

  it("halted invalid sequence preserves replay determinism", () => {
    const invalid: SimulationCommand[] = [
      { type: "REUSE_SERVICE_HEAT", units: 1 },
      { type: "ADD_SYSTEM_HEAT", units: 999 },
    ]
    const a = replaySimulation(createBaselineSimulation(), invalid)
    const b = replaySimulation(createBaselineSimulation(), invalid)
    expect(a.halted).toBe(true)
    expect(hashSimulationState(a)).toBe(hashSimulationState(b))
  })
})
