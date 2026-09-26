import { createHash } from "node:crypto"

export type ThermalBand = "GREEN" | "AMBER" | "RED"
export type FieldStatus = "NORMAL" | "DEGRADED"
export type WaterStoreKey = "ocean" | "groundwater" | "central" | "surface" | "lung"

export const GP_TEST_001 = Object.freeze({
  fixtureId: "GP-TEST-001",
  shellOrder: 3 as const,
  totalLandKm2: 10_434,
  totalResidents: 3_600,
  watershedCount: 9,
  landAnchorFieldCount: 12,
  totalWater: 12_000_000,
  normalWaterCommand: 10_000,
  pumpCount: 3,
  pumpCapacity: 6_000,
  returnZoneCount: 9,
  returnZoneCapacity: 1_500,
  edgeCount: 3,
  trunkCapacity: 600,
  edgeDemand: 1_000,
  criticalEdgeDemand: 500,
  symbolSectorCount: 12,
  normalPowerDemand: 3_000,
  residentHeat: 360,
  environmentalHeat: 240,
  systemHeat: 400,
  reuseCapacity: 600,
  thermalReturnCapacity: 500,
} as const)

export interface Island {
  id: string
  landKm2: number
  residents: number
  watershedIds: string[]
}
export interface Pump {
  id: string
  capacity: number
  active: boolean
}

export interface ReturnZone {
  id: string
  capacity: number
  active: boolean
}

export interface AnchorElement {
  id: string
  capacity: number
  active: boolean
}

export interface AnchorField {
  id: string
  islandId: string
  load: number
  status: FieldStatus
  anchors: AnchorElement[]
  allocation: Record<string, number>
}

export interface EdgeState {
  id: string
  demand: number
  criticalDemand: number
  trunkA: { id: string; capacity: number; active: boolean }
  trunkB: { id: string; capacity: number; active: boolean }
  served: number
  held: number
}

export interface SymbolSector {
  id: string
  face: 1 | 2 | 3
  demand: number
  emergencyDemand: number
  online: boolean
  thermalBand: ThermalBand
}
export interface WaterState {
  ocean: number
  groundwater: number
  central: number
  surface: number
  lung: number
  pumps: Pump[]
  returnZones: ReturnZone[]
}

export interface ThermalState {
  resident: number
  environmental: number
  system: number
  serviceBuffer: number
  reused: number
  returned: number
  band: ThermalBand
}

export interface EnergyState {
  energyIn: number
  usefulWork: number
  storedEnergyDelta: number
  heatGenerated: number
  energyReturned: number
}

export interface GPTestState {
  fixtureId: "GP-TEST-001"
  shellOrder: 3
  tick: number
  islands: Island[]
  water: WaterState
  anchorFields: AnchorField[]
  edges: EdgeState[]
  symbols: SymbolSector[]
  thermal: ThermalState
  energy: EnergyState
  halted: boolean
  failureCode: string | null
}
const WATER_CAPACITY: Record<WaterStoreKey, number> = {
  ocean: 8_000_000,
  groundwater: 3_000_000,
  central: 2_000_000,
  surface: 1_000_000,
  lung: 1_000_000,
}

const pad2 = (n: number) => String(n).padStart(2, "0")
const pad3 = (n: number) => String(n).padStart(3, "0")

function allocateExact(total: number, ids: readonly string[], capacity: number): Record<string, number> | null {
  if (total < 0 || ids.length === 0) return null
  const ordered = [...ids].sort()
  const q = Math.floor(total / ordered.length)
  const r = total % ordered.length
  if (q + (r > 0 ? 1 : 0) > capacity) return null
  return Object.fromEntries(ordered.map((id, i) => [id, q + (i < r ? 1 : 0)]))
}

function createIslands(): Island[] {
  return [
    {
      id: "GP-ISLAND-A",
      landKm2: 6_260,
      residents: 2_400,
      watershedIds: Array.from({ length: 5 }, (_, i) => `GP-WATERSHED-A${pad2(i + 1)}`),
    },
    {
      id: "GP-ISLAND-B",
      landKm2: 2_608,
      residents: 800,
      watershedIds: Array.from({ length: 2 }, (_, i) => `GP-WATERSHED-B${pad2(i + 1)}`),
    },
    {
      id: "GP-ISLAND-C",
      landKm2: 1_566,
      residents: 400,
      watershedIds: Array.from({ length: 2 }, (_, i) => `GP-WATERSHED-C${pad2(i + 1)}`),
    },
  ]
}
function createAnchorField(index: number, islandId: string): AnchorField {
  const id = `GP-ANCHOR-FIELD-${pad3(index)}`
  const anchors = Array.from({ length: 5 }, (_, i) => ({
    id: `${id}-ANCHOR-${pad2(i + 1)}`,
    capacity: 250,
    active: true,
  }))
  const allocation = allocateExact(1_000, anchors.map(a => a.id), 250)!
  return { id, islandId, load: 1_000, status: "NORMAL", anchors, allocation }
}

function createAnchorFields(): AnchorField[] {
  return [
    ...Array.from({ length: 6 }, (_, i) => createAnchorField(i + 1, "GP-ISLAND-A")),
    ...Array.from({ length: 3 }, (_, i) => createAnchorField(i + 7, "GP-ISLAND-B")),
    ...Array.from({ length: 3 }, (_, i) => createAnchorField(i + 10, "GP-ISLAND-C")),
  ]
}

function createEdges(): EdgeState[] {
  return Array.from({ length: 3 }, (_, i) => {
    const n = pad2(i + 1)
    return {
      id: `GP-EDGE-${n}`,
      demand: GP_TEST_001.edgeDemand,
      criticalDemand: GP_TEST_001.criticalEdgeDemand,
      trunkA: { id: `GP-EDGE-${n}-A`, capacity: GP_TEST_001.trunkCapacity, active: true },
      trunkB: { id: `GP-EDGE-${n}-B`, capacity: GP_TEST_001.trunkCapacity, active: true },
      served: GP_TEST_001.edgeDemand,
      held: 0,
    }
  })
}
function createSymbols(): SymbolSector[] {
  return Array.from({ length: 12 }, (_, i) => ({
    id: `GP-SYMBOL-${pad2(i + 1)}`,
    face: (Math.floor(i / 4) + 1) as 1 | 2 | 3,
    demand: 100,
    emergencyDemand: 10,
    online: true,
    thermalBand: "GREEN" as ThermalBand,
  }))
}

export function createGPTest001Baseline(): GPTestState {
  return {
    fixtureId: "GP-TEST-001",
    shellOrder: 3,
    tick: 0,
    islands: createIslands(),
    water: {
      ocean: 7_200_000,
      groundwater: 2_400_000,
      central: 1_200_000,
      surface: 600_000,
      lung: 600_000,
      pumps: Array.from({ length: 3 }, (_, i) => ({
        id: `GP-PUMP-${pad2(i + 1)}`,
        capacity: GP_TEST_001.pumpCapacity,
        active: true,
      })),
      returnZones: Array.from({ length: 9 }, (_, i) => ({
        id: `GP-RETURN-${pad2(i + 1)}`,
        capacity: GP_TEST_001.returnZoneCapacity,
        active: true,
      })),
    },
    anchorFields: createAnchorFields(),
    edges: createEdges(),
    symbols: createSymbols(),
    thermal: {
      resident: GP_TEST_001.residentHeat,
      environmental: GP_TEST_001.environmentalHeat,
      system: GP_TEST_001.systemHeat,
      serviceBuffer: 0,
      reused: 0,
      returned: 0,
      band: "GREEN",
    },
    energy: {
      energyIn: 0,
      usefulWork: 0,
      storedEnergyDelta: 0,
      heatGenerated: 0,
      energyReturned: 0,
    },
    halted: false,
    failureCode: null,
  }
}

export function totalWater(state: GPTestState): number {
  const w = state.water
  return w.ocean + w.groundwater + w.central + w.surface + w.lung
}

export function activePumpCapacity(state: GPTestState): number {
  return state.water.pumps.filter(p => p.active).reduce((sum, p) => sum + p.capacity, 0)
}

export function activeReturnCapacity(state: GPTestState): number {
  return state.water.returnZones.filter(z => z.active).reduce((sum, z) => sum + z.capacity, 0)
}

export type GPCommand =
  | { type: "ISOLATE_ANCHOR"; fieldId: string; anchorId: string }
  | { type: "ISOLATE_PUMP"; pumpId: string }
  | { type: "ISOLATE_RETURN_ZONE"; returnZoneId: string }
  | { type: "ISOLATE_TRUNK"; edgeId: string; trunk: "A" | "B" }
  | { type: "SET_SYMBOL_RED"; sectorId: string }
  | { type: "SET_RESIDENT_HEAT"; units: number }
  | { type: "THERMAL_TICK" }
  | { type: "WATER_TRANSFER"; from: WaterStoreKey; to: WaterStoreKey; units: number }
  | {
      type: "ENERGY_TICK"
      energyIn: number
      usefulWork: number
      storedEnergyDelta: number
      heatGenerated: number
      energyReturned: number
    }

export interface GPResult {
  accepted: boolean
  state: GPTestState
  failureCode: string | null
}

function clone(state: GPTestState): GPTestState {
  return structuredClone(state)
}

function deny(state: GPTestState, code: string): GPResult {
  const next = clone(state)
  next.halted = true
  next.failureCode = code
  return { accepted: false, state: next, failureCode: code }
}

function accept(next: GPTestState): GPResult {
  next.tick += 1
  next.halted = false
  next.failureCode = null
  return { accepted: true, state: next, failureCode: null }
}

function recalcEdge(edge: EdgeState): void {
  const cap =
    (edge.trunkA.active ? edge.trunkA.capacity : 0) +
    (edge.trunkB.active ? edge.trunkB.capacity : 0)
  edge.served = Math.min(edge.demand, cap)
  edge.held = edge.demand - edge.served
}
function classifyBuffer(buffer: number): ThermalBand {
  if (buffer <= 100) return "GREEN"
  if (buffer <= 300) return "AMBER"
  return "RED"
}

export function applyGPCommand(state: GPTestState, command: GPCommand): GPResult {
  if (state.halted) return deny(state, "STATE_HALTED")
  const next = clone(state)

  if (command.type === "ISOLATE_ANCHOR") {
    const field = next.anchorFields.find(f => f.id === command.fieldId)
    if (!field) return deny(state, "FIELD_NOT_FOUND")
    const anchor = field.anchors.find(a => a.id === command.anchorId)
    if (!anchor || !anchor.active) return deny(state, "ANCHOR_NOT_ACTIVE")
    anchor.active = false
    const active = field.anchors.filter(a => a.active)
    const allocation = allocateExact(field.load, active.map(a => a.id), 250)
    field.allocation = allocation ?? {}
    field.status = allocation ? "NORMAL" : "DEGRADED"
    return accept(next)
  }

  if (command.type === "ISOLATE_PUMP") {
    const pump = next.water.pumps.find(p => p.id === command.pumpId)
    if (!pump || !pump.active) return deny(state, "PUMP_NOT_ACTIVE")
    pump.active = false
    return accept(next)
  }

  if (command.type === "ISOLATE_RETURN_ZONE") {
    const zone = next.water.returnZones.find(z => z.id === command.returnZoneId)
    if (!zone || !zone.active) return deny(state, "RETURN_ZONE_NOT_ACTIVE")
    zone.active = false
    return accept(next)
  }
  if (command.type === "ISOLATE_TRUNK") {
    const edge = next.edges.find(e => e.id === command.edgeId)
    if (!edge) return deny(state, "EDGE_NOT_FOUND")
    const trunk = command.trunk === "A" ? edge.trunkA : edge.trunkB
    if (!trunk.active) return deny(state, "TRUNK_NOT_ACTIVE")
    trunk.active = false
    recalcEdge(edge)
    if (edge.served < edge.criticalDemand) return deny(state, "CRITICAL_POWER_UNSERVED")
    return accept(next)
  }

  if (command.type === "SET_SYMBOL_RED") {
    const sector = next.symbols.find(s => s.id === command.sectorId)
    if (!sector) return deny(state, "SYMBOL_NOT_FOUND")
    sector.thermalBand = "RED"
    sector.online = false
    return accept(next)
  }

  if (command.type === "SET_RESIDENT_HEAT") {
    if (command.units < 0) return deny(state, "INVALID_HEAT")
    next.thermal.resident = command.units
    return accept(next)
  }

  if (command.type === "THERMAL_TICK") {
    const source = next.thermal.resident + next.thermal.environmental + next.thermal.system
    const reused = Math.min(source, GP_TEST_001.reuseCapacity)
    const remainder = source - reused
    const returned = Math.min(remainder, GP_TEST_001.thermalReturnCapacity)
    const buffer = remainder - returned
    next.thermal.reused = reused
    next.thermal.returned = returned
    next.thermal.serviceBuffer = buffer
    next.thermal.band = classifyBuffer(buffer)
    return accept(next)
  }
  if (command.type === "WATER_TRANSFER") {
    if (command.units < 0 || command.from === command.to) return deny(state, "INVALID_WATER_TRANSFER")
    const source = next.water[command.from] as number
    const destination = next.water[command.to] as number
    if (command.units > source) return deny(state, "WATER_SOURCE_UNDERFLOW")
    if (destination + command.units > WATER_CAPACITY[command.to]) {
      return deny(state, "WATER_DESTINATION_OVERFLOW")
    }
    ;(next.water[command.from] as number) = source - command.units
    ;(next.water[command.to] as number) = destination + command.units
    if (totalWater(next) !== GP_TEST_001.totalWater) return deny(state, "WATER_CONSERVATION_FAILURE")
    return accept(next)
  }

  if (command.type === "ENERGY_TICK") {
    const rhs =
      command.usefulWork +
      command.storedEnergyDelta +
      command.heatGenerated +
      command.energyReturned
    if (command.energyIn !== rhs) return deny(state, "ENERGY_IMBALANCE")
    next.energy.energyIn += command.energyIn
    next.energy.usefulWork += command.usefulWork
    next.energy.storedEnergyDelta += command.storedEnergyDelta
    next.energy.heatGenerated += command.heatGenerated
    next.energy.energyReturned += command.energyReturned
    return accept(next)
  }

  return deny(state, "UNKNOWN_COMMAND")
}

export function canonicalGPState(state: GPTestState): string {
  return JSON.stringify(state)
}

export function hashGPState(state: GPTestState): string {
  return createHash("sha256").update(canonicalGPState(state)).digest("hex")
}

export function replayGPCommands(initial: GPTestState, commands: readonly GPCommand[]): GPTestState {
  let state = clone(initial)
  for (const command of commands) {
    const result = applyGPCommand(state, command)
    state = result.state
    if (!result.accepted) break
  }
  return state
}
