import { createHash } from "node:crypto"

export type ShellOrder = 3 | 4 | 5
export type FieldStatus = "NORMAL" | "DEGRADED" | "ISOLATED"
export type ThermalBand = "GREEN" | "AMBER" | "RED"

export interface AnchorElement {
  id: string
  capacity: number
  active: boolean
}

export interface LandAnchorField {
  id: string
  load: number
  anchors: AnchorElement[]
  status: FieldStatus
  allocation: Record<string, number>
}
export interface PowerEdge {
  id: string
  demand: number
  criticalDemand: number
  trunkA: { id: string; capacity: number; active: boolean }
  trunkB: { id: string; capacity: number; active: boolean }
  served: number
  held: number
}

export interface RelayNode {
  id: string
  active: boolean
}

export interface SymbolSector {
  id: string
  powerDemand: number
  emergencyPower: number
  systemHeatPerTick: number
  feedRelayIds: [string, string]
  online: boolean
  thermalBand: ThermalBand
}
export interface ThermalLedger {
  resident: number
  environmental: number
  system: number
  service: number
  reused: number
  returned: number
  stored: number
  returnCapacity: number
}

export interface EnergyLedger {
  energyIn: number
  usefulWork: number
  storedEnergyDelta: number
  heatGenerated: number
  energyReturned: number
}

export interface SimulationState {
  shellOrder: ShellOrder
  tick: number
  fields: LandAnchorField[]
  edges: PowerEdge[]
  relays: RelayNode[]
  symbolSectors: SymbolSector[]
  thermal: ThermalLedger
  energy: EnergyLedger
  halted: boolean
  failureCode: string | null
}

export const SIM = {
  fieldCount: 120,
  anchorsPerField: 5,
  fieldLoad: 1_000,
  anchorCapacity: 250,
  trunkCapacity: 600,
  edgeDemand: 1_000,
  edgeCriticalDemand: 500,
  symbolSectorCount: 60,
  symbolPowerDemand: 100,
  symbolEmergencyPower: 10,
  symbolSystemHeatPerTick: 10,
  thermalReturnCapacity: 1_000,
} as const

const edgeCount = (shell: ShellOrder) => shell
export function allocateInteger(
  total: number,
  ids: readonly string[],
  capacity: number,
): Record<string, number> | null {
  if (total < 0 || ids.length === 0) return null
  const ordered = [...ids].sort()
  const q = Math.floor(total / ordered.length)
  const r = total % ordered.length
  if (q + (r > 0 ? 1 : 0) > capacity) return null
  return Object.fromEntries(
    ordered.map((id, i) => [id, q + (i < r ? 1 : 0)]),
  )
}

function makeField(index: number): LandAnchorField {
  const id = `land-anchor-field-${String(index).padStart(3, "0")}`
  const anchors = Array.from({ length: SIM.anchorsPerField }, (_, i) => ({
    id: `${id}-anchor-${String(i + 1).padStart(2, "0")}`,
    capacity: SIM.anchorCapacity,
    active: true,
  }))
  const allocation = allocateInteger(
    SIM.fieldLoad,
    anchors.map(a => a.id),
    SIM.anchorCapacity,
  )!
  return { id, load: SIM.fieldLoad, anchors, status: "NORMAL", allocation }
}

function makeEdges(shell: ShellOrder): PowerEdge[] {
  return Array.from({ length: edgeCount(shell) }, (_, i) => {
    const id = `edge-${String(i + 1).padStart(2, "0")}`
    return {
      id,
      demand: SIM.edgeDemand,
      criticalDemand: SIM.edgeCriticalDemand,
      trunkA: { id: `${id}-trunk-a`, capacity: SIM.trunkCapacity, active: true },
      trunkB: { id: `${id}-trunk-b`, capacity: SIM.trunkCapacity, active: true },
      served: SIM.edgeDemand,
      held: 0,
    }
  })
}

function makeRelays(): RelayNode[] {
  return Array.from({ length: 120 }, (_, i) => ({
    id: `relay-${String(i + 1).padStart(3, "0")}`,
    active: true,
  }))
}
function makeSymbolSectors(): SymbolSector[] {
  return Array.from({ length: SIM.symbolSectorCount }, (_, i) => {
    const n = i + 1
    return {
      id: `symbol-sector-${String(n).padStart(3, "0")}`,
      powerDemand: SIM.symbolPowerDemand,
      emergencyPower: SIM.symbolEmergencyPower,
      systemHeatPerTick: SIM.symbolSystemHeatPerTick,
      feedRelayIds: [
        `relay-${String((i * 2) + 1).padStart(3, "0")}`,
        `relay-${String((i * 2) + 2).padStart(3, "0")}`,
      ],
      online: true,
      thermalBand: "GREEN",
    }
  })
}

export function createBaselineSimulation(shellOrder: ShellOrder = 5): SimulationState {
  return {
    shellOrder,
    tick: 0,
    fields: Array.from({ length: SIM.fieldCount }, (_, i) => makeField(i + 1)),
    edges: makeEdges(shellOrder),
    relays: makeRelays(),
    symbolSectors: makeSymbolSectors(),
    thermal: {
      resident: 0,
      environmental: 0,
      system: 0,
      service: 0,
      reused: 0,
      returned: 0,
      stored: 0,
      returnCapacity: SIM.thermalReturnCapacity,
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

export type SimulationCommand =
  | { type: "ISOLATE_ANCHOR"; fieldId: string; anchorId: string }
  | { type: "ISOLATE_FIELD"; fieldId: string; transferCapacity: number }
  | { type: "ISOLATE_TRUNK"; edgeId: string; trunk: "A" | "B" }
  | { type: "RESTORE_TRUNK"; edgeId: string; trunk: "A" | "B" }
  | { type: "ISOLATE_RELAY"; relayId: string }
  | { type: "SET_SYMBOL_OFFLINE"; sectorId: string }
  | { type: "SET_SYMBOL_THERMAL"; sectorId: string; band: ThermalBand }
  | { type: "ADD_RESIDENT_HEAT"; units: number }
  | { type: "ADD_ENVIRONMENTAL_HEAT"; units: number }
  | { type: "ADD_SYSTEM_HEAT"; units: number }
  | { type: "COLLECT_HEAT" }
  | { type: "REUSE_SERVICE_HEAT"; units: number }
  | { type: "RETURN_SERVICE_HEAT"; units: number }
  | {
      type: "ENERGY_TICK"
      energyIn: number
      usefulWork: number
      storedEnergyDelta: number
      heatGenerated: number
      energyReturned: number
    }

export interface SimulationResult {
  accepted: boolean
  state: SimulationState
  failureCode: string | null
}
function cloneState(state: SimulationState): SimulationState {
  return structuredClone(state)
}

function denied(state: SimulationState, code: string): SimulationResult {
  const next = cloneState(state)
  next.halted = true
  next.failureCode = code
  return { accepted: false, state: next, failureCode: code }
}

function ok(state: SimulationState): SimulationResult {
  state.tick += 1
  state.halted = false
  state.failureCode = null
  return { accepted: true, state, failureCode: null }
}

function rebalanceEdge(edge: PowerEdge): void {
  const capacity =
    (edge.trunkA.active ? edge.trunkA.capacity : 0) +
    (edge.trunkB.active ? edge.trunkB.capacity : 0)
  edge.served = Math.min(edge.demand, capacity)
  edge.held = edge.demand - edge.served
}

function sourceHeat(t: ThermalLedger): number {
  return t.resident + t.environmental + t.system
}
export function totalThermalAccounted(t: ThermalLedger): number {
  return sourceHeat(t) + t.service + t.reused + t.returned + t.stored
}

export function applySimulationCommand(
  state: SimulationState,
  command: SimulationCommand,
): SimulationResult {
  if (state.halted) return denied(state, "STATE_HALTED")
  const next = cloneState(state)

  if (command.type === "ISOLATE_ANCHOR") {
    const field = next.fields.find(f => f.id === command.fieldId)
    if (!field) return denied(state, "FIELD_NOT_FOUND")
    const anchor = field.anchors.find(a => a.id === command.anchorId)
    if (!anchor || !anchor.active) return denied(state, "ANCHOR_NOT_ACTIVE")
    anchor.active = false
    const active = field.anchors.filter(a => a.active)
    const allocation = allocateInteger(field.load, active.map(a => a.id), SIM.anchorCapacity)
    field.allocation = allocation ?? {}
    field.status = allocation ? "NORMAL" : "DEGRADED"
    return ok(next)
  }
  if (command.type === "ISOLATE_FIELD") {
    const field = next.fields.find(f => f.id === command.fieldId)
    if (!field) return denied(state, "FIELD_NOT_FOUND")
    if (command.transferCapacity < field.load) {
      return denied(state, "LOAD_TRANSFER_INSUFFICIENT")
    }
    field.status = "ISOLATED"
    field.allocation = {}
    field.anchors.forEach(a => { a.active = false })
    return ok(next)
  }

  if (command.type === "ISOLATE_TRUNK" || command.type === "RESTORE_TRUNK") {
    const edge = next.edges.find(e => e.id === command.edgeId)
    if (!edge) return denied(state, "EDGE_NOT_FOUND")
    const trunk = command.trunk === "A" ? edge.trunkA : edge.trunkB
    trunk.active = command.type === "RESTORE_TRUNK"
    rebalanceEdge(edge)
    if (edge.served < edge.criticalDemand) {
      return denied(state, "CRITICAL_POWER_UNSERVED")
    }
    return ok(next)
  }

  if (command.type === "ISOLATE_RELAY") {
    const relay = next.relays.find(r => r.id === command.relayId)
    if (!relay || !relay.active) return denied(state, "RELAY_NOT_ACTIVE")
    relay.active = false
    return ok(next)
  }
  if (command.type === "SET_SYMBOL_OFFLINE") {
    const sector = next.symbolSectors.find(s => s.id === command.sectorId)
    if (!sector) return denied(state, "SYMBOL_SECTOR_NOT_FOUND")
    sector.online = false
    return ok(next)
  }

  if (command.type === "SET_SYMBOL_THERMAL") {
    const sector = next.symbolSectors.find(s => s.id === command.sectorId)
    if (!sector) return denied(state, "SYMBOL_SECTOR_NOT_FOUND")
    sector.thermalBand = command.band
    if (command.band === "RED") sector.online = false
    return ok(next)
  }

  if (command.type === "ADD_RESIDENT_HEAT") {
    if (command.units < 0) return denied(state, "INVALID_HEAT")
    next.thermal.resident += command.units
    return ok(next)
  }

  if (command.type === "ADD_ENVIRONMENTAL_HEAT") {
    if (command.units < 0) return denied(state, "INVALID_HEAT")
    next.thermal.environmental += command.units
    return ok(next)
  }
  if (command.type === "ADD_SYSTEM_HEAT") {
    if (command.units < 0) return denied(state, "INVALID_HEAT")
    next.thermal.system += command.units
    return ok(next)
  }

  if (command.type === "COLLECT_HEAT") {
    const collected = sourceHeat(next.thermal)
    next.thermal.service += collected
    next.thermal.resident = 0
    next.thermal.environmental = 0
    next.thermal.system = 0
    return ok(next)
  }

  if (command.type === "REUSE_SERVICE_HEAT") {
    if (command.units < 0 || command.units > next.thermal.service) {
      return denied(state, "SERVICE_HEAT_UNDERFLOW")
    }
    next.thermal.service -= command.units
    next.thermal.reused += command.units
    return ok(next)
  }

  if (command.type === "RETURN_SERVICE_HEAT") {
    if (command.units < 0 || command.units > next.thermal.service) {
      return denied(state, "SERVICE_HEAT_UNDERFLOW")
    }
    const returned = Math.min(command.units, next.thermal.returnCapacity)
    next.thermal.service -= returned
    next.thermal.returned += returned
    return ok(next)
  }

  if (command.type === "ENERGY_TICK") {
    const rhs =
      command.usefulWork +
      command.storedEnergyDelta +
      command.heatGenerated +
      command.energyReturned
    if (command.energyIn !== rhs) return denied(state, "ENERGY_IMBALANCE")
    next.energy.energyIn += command.energyIn
    next.energy.usefulWork += command.usefulWork
    next.energy.storedEnergyDelta += command.storedEnergyDelta
    next.energy.heatGenerated += command.heatGenerated
    next.energy.energyReturned += command.energyReturned
    next.thermal.system += command.heatGenerated
    return ok(next)
  }

  return denied(state, "UNKNOWN_COMMAND")
}

export function canonicalSimulationState(state: SimulationState): string {
  return JSON.stringify(state)
}
export function hashSimulationState(state: SimulationState): string {
  return createHash("sha256").update(canonicalSimulationState(state)).digest("hex")
}

export function replaySimulation(
  initial: SimulationState,
  commands: readonly SimulationCommand[],
): SimulationState {
  let state = cloneState(initial)
  for (const command of commands) {
    const result = applySimulationCommand(state, command)
    state = result.state
    if (!result.accepted) break
  }
  return state
}

export const BOTTOM_SYSTEMS = Object.freeze([
  "GRAVITY_BED",
  "PYRAMID_LUNG",
  "BOUNDARY_BOULDER",
  "LAND_ANCHOR_INTERFACE",
  "BEARING_FORGE_PATH",
  "PLATEDGOLD_SERVICE",
  "THERMAL_RETURN_INTERFACE",
] as const)

export const THERMAL_MAPPING = Object.freeze({
  HOLD: "RESIDENT_HEAT",
  RELATE: "ENVIRONMENTAL_HEAT",
  UNDERSTAND: "SERVICE_HEAT",
  BECOME: "SYSTEM_HEAT",
  RETURN: "CARRIES_REMAINDER",
} as const)
