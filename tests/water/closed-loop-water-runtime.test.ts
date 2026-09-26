import { describe, expect, it } from "vitest"
import {
  WATER,
  GEOMETRY,
  activeBeltCapacity,
  activePumpCapacity,
  activeSectorIds,
  allocateIntegerFlow,
  applyWaterCommand,
  beltCommandLimit,
  canonicalWaterState,
  classifyAquifer,
  classifyOcean,
  createBaselineWaterState,
  hashWaterState,
  replayWaterCommands,
  totalWater,
  type ShellOrder,
  type WaterCommand,
} from "../../src/water/closed-loop-water-runtime.js"

describe("CLOSED-LOOP WATER RUNTIME RUNBOOK 001 — baseline and conservation", () => {
  it("locks the one-second integer accounting contract", () => {
    expect(WATER.tickSeconds).toBe(1)
    expect(WATER.flowUnitM3PerSecond).toBe(1_000)
    expect(WATER.storageUnitM3).toBe(1_000)
    expect(WATER.normalFlow).toBe(252_270)
  })

  it("normal steady-state tick preserves total Water", () => {
    const initial = createBaselineWaterState(5)
    const before = totalWater(initial)
    const result = applyWaterCommand(initial, { type: "TICK_NORMAL" })
    expect(result.accepted).toBe(true)
    expect(result.state.tick).toBe(1)
    expect(totalWater(result.state)).toBe(before)
  })

  it("source underflow DENY/HALT preserves Water storage", () => {
    const initial = createBaselineWaterState(3)
    const result = applyWaterCommand(initial, {
      type: "TRANSFER",
      from: "groundwater",
      to: "lakePond",
      units: 1,
    })
    expect(result.accepted).toBe(false)
    expect(result.failureCode).toBe("SOURCE_UNDERFLOW")
    expect(totalWater(result.state)).toBe(totalWater(initial))
    expect(result.state.groundwater).toBe(initial.groundwater)
    expect(result.state.lakePond).toBe(initial.lakePond)
  })

  it("destination overflow DENY/HALT has no partial debit or credit", () => {
    const initial = createBaselineWaterState(4)
    const result = applyWaterCommand(initial, {
      type: "TRANSFER",
      from: "ocean",
      to: "aquifer",
      units: WATER.aquiferCapacity - initial.aquifer + 1,
    })
    expect(result.accepted).toBe(false)
    expect(result.failureCode).toBe("DESTINATION_OVERFLOW")
    expect(result.state.ocean).toBe(initial.ocean)
    expect(result.state.aquifer).toBe(initial.aquifer)
    expect(totalWater(result.state)).toBe(totalWater(initial))
  })
})

describe("CLOSED-LOOP WATER RUNTIME RUNBOOK 001 — replay equality", () => {
  it("identical initial state and command stream produce identical canonical state", () => {
    const initial = createBaselineWaterState(5)
    const commands: WaterCommand[] = [
      { type: "ISOLATE_PUMP", pumpId: "pump-001" },
      { type: "ISOLATE_SECTOR", sectorId: "shell-5-sector-001" },
      { type: "TICK_NORMAL" },
      { type: "RESTORE_SECTOR", sectorId: "shell-5-sector-001" },
      { type: "RESTORE_PUMP", pumpId: "pump-001" },
      { type: "TICK_NORMAL" },
    ]
    const a = replayWaterCommands(initial, commands)
    const b = replayWaterCommands(createBaselineWaterState(5), commands)
    expect(canonicalWaterState(a)).toBe(canonicalWaterState(b))
    expect(hashWaterState(a)).toBe(hashWaterState(b))
  })
})

describe("CLOSED-LOOP WATER RUNTIME RUNBOOK 001 — one-pump-out", () => {
  it("three trains retain normal Scenario B flow", () => {
    const initial = createBaselineWaterState(5)
    const isolated = applyWaterCommand(initial, { type: "ISOLATE_PUMP", pumpId: "pump-001" }).state
    expect(activePumpCapacity(isolated)).toBe(256_500)
    const tick = applyWaterCommand(isolated, { type: "TICK_NORMAL" })
    expect(tick.accepted).toBe(true)
    expect(tick.state.lastBeltCommand).toBe(252_270)
  })

  it("restoring a train changes capacity, not Water storage", () => {
    const initial = createBaselineWaterState(5)
    const isolated = applyWaterCommand(initial, { type: "ISOLATE_PUMP", pumpId: "pump-001" }).state
    const before = totalWater(isolated)
    const restored = applyWaterCommand(isolated, { type: "RESTORE_PUMP", pumpId: "pump-001" }).state
    expect(activePumpCapacity(restored)).toBe(342_000)
    expect(totalWater(restored)).toBe(before)
  })
})

describe("CLOSED-LOOP WATER RUNTIME RUNBOOK 001 — one-sector-out", () => {
  const cases: Array<[ShellOrder, number, number, number]> = [
    [3, 38, 6_638, 26],
    [4, 31, 8_137, 23],
    [5, 29, 8_698, 28],
  ]

  it.each(cases)("Shell-%i redistributes exactly across %i active sectors", (shell, count, quotient, remainder) => {
    const initial = createBaselineWaterState(shell)
    const first = activeSectorIds(initial)[0]
    const isolated = applyWaterCommand(initial, { type: "ISOLATE_SECTOR", sectorId: first }).state
    const ids = activeSectorIds(isolated)
    expect(ids.length).toBe(count)
    expect(activeBeltCapacity(isolated)).toBe(count * WATER.sectorCapacity)

    const allocation = allocateIntegerFlow(WATER.normalFlow, ids, WATER.sectorCapacity)
    expect(Object.values(allocation).reduce((a, b) => a + b, 0)).toBe(WATER.normalFlow)
    expect(Object.values(allocation).filter(v => v === quotient + 1)).toHaveLength(remainder)
    expect(Object.values(allocation).filter(v => v === quotient)).toHaveLength(count - remainder)
    expect(Math.max(...Object.values(allocation))).toBeLessThanOrEqual(WATER.sectorCapacity)

    const tick = applyWaterCommand(isolated, { type: "TICK_NORMAL" })
    expect(tick.accepted).toBe(true)
  })
})

describe("CLOSED-LOOP WATER RUNTIME RUNBOOK 001 — Ocean boundaries", () => {
  it("classifies exact low-side boundaries and one-unit edges", () => {
    expect(classifyOcean(WATER.oceanGreenLowBoundary)).toBe("GREEN")
    expect(classifyOcean(WATER.oceanGreenLowBoundary - 1)).toBe("AMBER_LOW")
    expect(classifyOcean(WATER.oceanRedLowBoundary)).toBe("AMBER_LOW")
    expect(classifyOcean(WATER.oceanRedLowBoundary - 1)).toBe("RED_LOW")
  })

  it("classifies exact high-side boundaries and one-unit edges", () => {
    expect(classifyOcean(WATER.oceanGreenHighBoundary)).toBe("GREEN")
    expect(classifyOcean(WATER.oceanGreenHighBoundary + 1)).toBe("AMBER_HIGH")
    expect(classifyOcean(WATER.oceanRedHighBoundary)).toBe("AMBER_HIGH")
    expect(classifyOcean(WATER.oceanRedHighBoundary + 1)).toBe("RED_HIGH")
  })
})

describe("CLOSED-LOOP WATER RUNTIME RUNBOOK 001 — Aquifer boundaries", () => {
  it("classifies exact low-side boundaries and one-unit edges", () => {
    expect(classifyAquifer(WATER.aquiferGreenLowBoundary)).toBe("GREEN")
    expect(classifyAquifer(WATER.aquiferGreenLowBoundary - 1)).toBe("AMBER_LOW")
    expect(classifyAquifer(WATER.aquiferRedLowBoundary)).toBe("AMBER_LOW")
    expect(classifyAquifer(WATER.aquiferRedLowBoundary - 1)).toBe("RED_LOW")
  })

  it("classifies exact high-side boundaries and one-unit edges", () => {
    expect(classifyAquifer(WATER.aquiferGreenHighBoundary)).toBe("GREEN")
    expect(classifyAquifer(WATER.aquiferGreenHighBoundary + 1)).toBe("AMBER_HIGH")
    expect(classifyAquifer(WATER.aquiferRedHighBoundary)).toBe("AMBER_HIGH")
    expect(classifyAquifer(WATER.aquiferRedHighBoundary + 1)).toBe("RED_HIGH")
  })
})

describe("CLOSED-LOOP WATER RUNTIME RUNBOOK 001 — Belt/Lung backpressure", () => {
  it("uses normal matched return when all acceptance limits permit it", () => {
    const state = createBaselineWaterState(5)
    expect(beltCommandLimit(state, 999_999, 999_999, 999_999)).toBe(252_270)
  })

  it("caps at Lung acceptance", () => {
    const state = createBaselineWaterState(5)
    expect(beltCommandLimit(state, 999_999, 200_000, 999_999)).toBe(200_000)
  })

  it("caps at center acceptance", () => {
    const state = createBaselineWaterState(5)
    expect(beltCommandLimit(state, 999_999, 999_999, 175_000)).toBe(175_000)
  })

  it("returns zero when no Ocean Water is lawfully available", () => {
    const state = createBaselineWaterState(5)
    expect(beltCommandLimit(state, 0, 999_999, 999_999)).toBe(0)
  })
})

describe("CLOSED-LOOP WATER RUNTIME RUNBOOK 001 — Shell geometry", () => {
  it("locks the common interior hydrology envelope", () => {
    expect(GEOMETRY.common).toEqual({
      baseApothemKm: 1964.37,
      heightKm: 1964.37,
      worldRadiusKm: 1814.37,
      worldSurfaceDatumKm: 50,
      atmosphericTopKm: 150,
      beltTrenchDepthKm: 5,
      averageOceanFloorAboveBaseKm: 47,
      beltTrenchFloorAboveBaseKm: 45,
    })
    expect(GEOMETRY.common.beltTrenchFloorAboveBaseKm).toBeGreaterThanOrEqual(0)
    expect(GEOMETRY.common.beltTrenchFloorAboveBaseKm).toBeLessThanOrEqual(50)
  })

  it("locks Shell-3 / Shell-4 / Shell-5 displayed geometry", () => {
    expect(GEOMETRY[3]).toMatchObject({ sectorCount: 39, cellCount: 156, baseSideKm: 6804.78, volumeBillionKm3: 13.129 })
    expect(GEOMETRY[4]).toMatchObject({ sectorCount: 32, cellCount: 128, baseSideKm: 3928.74, volumeBillionKm3: 10.107 })
    expect(GEOMETRY[5]).toMatchObject({ sectorCount: 30, cellCount: 120, baseSideKm: 2854.40, volumeBillionKm3: 9.179 })
  })
})

describe("CLOSED-LOOP WATER RUNTIME RUNBOOK 001 — combined degraded-state recovery", () => {
  it("one pump plus one sector out remains normal-flow capable and replayable", () => {
    const initial = createBaselineWaterState(5)
    const commands: WaterCommand[] = [
      { type: "ISOLATE_PUMP", pumpId: "pump-001" },
      { type: "ISOLATE_SECTOR", sectorId: "shell-5-sector-001" },
      { type: "TICK_NORMAL" },
      { type: "RESTORE_SECTOR", sectorId: "shell-5-sector-001" },
      { type: "RESTORE_PUMP", pumpId: "pump-001" },
    ]
    const first = replayWaterCommands(initial, commands)
    const second = replayWaterCommands(createBaselineWaterState(5), commands)
    expect(first.halted).toBe(false)
    expect(activePumpCapacity(first)).toBe(WATER.centerCeiling)
    expect(activeSectorIds(first)).toHaveLength(30)
    expect(hashWaterState(first)).toBe(hashWaterState(second))
    expect(totalWater(first)).toBe(totalWater(initial))
  })
})
