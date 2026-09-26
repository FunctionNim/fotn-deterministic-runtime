import crypto from "crypto"

export type ShellOrder = 3 | 4 | 5
export type WaterBand = "GREEN" | "AMBER_LOW" | "AMBER_HIGH" | "RED_LOW" | "RED_HIGH"
export type WaterPool = "ocean" | "aquifer" | "lakePond" | "lungReturn" | "groundwater"
export type ModuleState = "ACTIVE" | "ISOLATED"

export const WATER = {
  tickSeconds: 1,
  flowUnitM3PerSecond: 1_000,
  storageUnitM3: 1_000,
  normalFlow: 252_270,
  centerCeiling: 342_000,
  pumpTrainCapacity: 85_500,
  pumpTrainCount: 4,
  aquiferCapacity: 43_592_256_000,
  aquiferNominal: 21_796_128_000,
  lakePondCapacity: 10_898_064_000,
  lakePondNominal: 5_449_032_000,
  lungReturnCapacity: 30_272_400,
  lungReturnNominal: 15_136_200,
  oceanNormalStorage: 7_960_975_000_000,
  oceanRedLowBoundary: 7_562_926_300_000,
  oceanGreenLowBoundary: 7_761_950_650_000,
  oceanGreenHighBoundary: 8_159_999_350_000,
  oceanRedHighBoundary: 8_359_023_700_000,
  aquiferRedLowBoundary: 4_359_225_600,
  aquiferGreenLowBoundary: 10_898_064_000,
  aquiferGreenHighBoundary: 32_694_192_000,
  aquiferRedHighBoundary: 39_233_030_400,
  sectorCapacity: 11_400,
  cellCapacity: 2_850,
  cellsPerSector: 4,
} as const

const SECTORS: Record<ShellOrder, number> = { 3: 39, 4: 32, 5: 30 }
const CELLS: Record<ShellOrder, number> = { 3: 156, 4: 128, 5: 120 }

export interface WaterState {
  readonly shellOrder: ShellOrder
  readonly tick: number
  readonly ocean: number
  readonly aquifer: number
  readonly lakePond: number
  readonly lungReturn: number
  readonly groundwater: number
  readonly inFlight: number
  readonly pumpTrains: Readonly<Record<string, ModuleState>>
  readonly sectors: Readonly<Record<string, ModuleState>>
  readonly lastBeltCommand: number
  readonly halted: boolean
  readonly failureCode: string | null
}

export type WaterCommand =
  | { readonly type: "TICK_NORMAL" }
  | { readonly type: "ISOLATE_PUMP"; readonly pumpId: string }
  | { readonly type: "RESTORE_PUMP"; readonly pumpId: string }
  | { readonly type: "ISOLATE_SECTOR"; readonly sectorId: string }
  | { readonly type: "RESTORE_SECTOR"; readonly sectorId: string }
  | { readonly type: "TRANSFER"; readonly from: WaterPool; readonly to: WaterPool; readonly units: number }
  | { readonly type: "BELT_COMMAND"; readonly oceanAvailable: number; readonly lungAcceptance: number; readonly centerAcceptance: number }

export interface ApplyResult {
  readonly state: WaterState
  readonly accepted: boolean
  readonly failureCode: string | null
}

function stableIds(prefix: string, count: number): Record<string, ModuleState> {
  const result: Record<string, ModuleState> = {}
  for (let i = 1; i <= count; i += 1) {
    result[`${prefix}-${String(i).padStart(3, "0")}`] = "ACTIVE"
  }
  return result
}

export function createBaselineWaterState(shellOrder: ShellOrder): WaterState {
  return {
    shellOrder,
    tick: 0,
    ocean: WATER.oceanNormalStorage,
    aquifer: WATER.aquiferNominal,
    lakePond: WATER.lakePondNominal,
    lungReturn: WATER.lungReturnNominal,
    groundwater: 0,
    inFlight: 0,
    pumpTrains: stableIds("pump", WATER.pumpTrainCount),
    sectors: stableIds(`shell-${shellOrder}-sector`, SECTORS[shellOrder]),
    lastBeltCommand: WATER.normalFlow,
    halted: false,
    failureCode: null,
  }
}

export function classifyOcean(storage: number): WaterBand {
  if (storage < WATER.oceanRedLowBoundary) return "RED_LOW"
  if (storage < WATER.oceanGreenLowBoundary) return "AMBER_LOW"
  if (storage <= WATER.oceanGreenHighBoundary) return "GREEN"
  if (storage <= WATER.oceanRedHighBoundary) return "AMBER_HIGH"
  return "RED_HIGH"
}

export function classifyAquifer(storage: number): WaterBand {
  if (storage < WATER.aquiferRedLowBoundary) return "RED_LOW"
  if (storage < WATER.aquiferGreenLowBoundary) return "AMBER_LOW"
  if (storage <= WATER.aquiferGreenHighBoundary) return "GREEN"
  if (storage <= WATER.aquiferRedHighBoundary) return "AMBER_HIGH"
  return "RED_HIGH"
}

export function totalWater(state: WaterState): number {
  return state.ocean + state.aquifer + state.lakePond + state.lungReturn + state.groundwater + state.inFlight
}

export function activePumpCapacity(state: WaterState): number {
  return Object.values(state.pumpTrains).filter(v => v === "ACTIVE").length * WATER.pumpTrainCapacity
}

export function activeSectorIds(state: WaterState): string[] {
  return Object.keys(state.sectors).filter(id => state.sectors[id] === "ACTIVE").sort()
}

export function activeBeltCapacity(state: WaterState): number {
  return activeSectorIds(state).length * WATER.sectorCapacity
}

export function allocateIntegerFlow(total: number, ids: readonly string[], perModuleLimit: number): Record<string, number> {
  if (!Number.isSafeInteger(total) || total < 0) throw new Error("INVALID_TOTAL")
  if (ids.length === 0) throw new Error("NO_ACTIVE_MODULES")
  const sorted = [...ids].sort()
  const quotient = Math.floor(total / sorted.length)
  const remainder = total % sorted.length
  if (quotient + (remainder > 0 ? 1 : 0) > perModuleLimit) throw new Error("MODULE_CAPACITY_EXCEEDED")
  const result: Record<string, number> = {}
  sorted.forEach((id, index) => {
    result[id] = quotient + (index < remainder ? 1 : 0)
  })
  return result
}

export function beltCommandLimit(state: WaterState, oceanAvailable: number, lungAcceptance: number, centerAcceptance: number): number {
  const values = [WATER.normalFlow, oceanAvailable, activeBeltCapacity(state), lungAcceptance, centerAcceptance]
  if (values.some(v => !Number.isSafeInteger(v) || v < 0)) throw new Error("INVALID_ACCEPTANCE")
  return Math.min(...values)
}

function deny(state: WaterState, failureCode: string): ApplyResult {
  return {
    state: { ...state, halted: true, failureCode },
    accepted: false,
    failureCode,
  }
}

function poolCapacity(pool: WaterPool): number | null {
  if (pool === "aquifer") return WATER.aquiferCapacity
  if (pool === "lakePond") return WATER.lakePondCapacity
  if (pool === "lungReturn") return WATER.lungReturnCapacity
  return null
}

function withPool(state: WaterState, pool: WaterPool, value: number): WaterState {
  return { ...state, [pool]: value }
}

export function applyWaterCommand(state: WaterState, command: WaterCommand): ApplyResult {
  if (state.halted) return { state, accepted: false, failureCode: state.failureCode }

  if (command.type === "TICK_NORMAL") {
    if (activePumpCapacity(state) < WATER.normalFlow) return deny(state, "PUMP_CAPACITY_EXCEEDED")
    if (activeBeltCapacity(state) < WATER.normalFlow) return deny(state, "BELT_CAPACITY_EXCEEDED")
    return { state: { ...state, tick: state.tick + 1, lastBeltCommand: WATER.normalFlow }, accepted: true, failureCode: null }
  }

  if (command.type === "ISOLATE_PUMP" || command.type === "RESTORE_PUMP") {
    if (!(command.pumpId in state.pumpTrains)) return deny(state, "UNKNOWN_PUMP")
    const next = { ...state.pumpTrains, [command.pumpId]: command.type === "ISOLATE_PUMP" ? "ISOLATED" : "ACTIVE" } as Record<string, ModuleState>
    return { state: { ...state, pumpTrains: next }, accepted: true, failureCode: null }
  }

  if (command.type === "ISOLATE_SECTOR" || command.type === "RESTORE_SECTOR") {
    if (!(command.sectorId in state.sectors)) return deny(state, "UNKNOWN_SECTOR")
    const next = { ...state.sectors, [command.sectorId]: command.type === "ISOLATE_SECTOR" ? "ISOLATED" : "ACTIVE" } as Record<string, ModuleState>
    return { state: { ...state, sectors: next }, accepted: true, failureCode: null }
  }

  if (command.type === "BELT_COMMAND") {
    const limit = beltCommandLimit(state, command.oceanAvailable, command.lungAcceptance, command.centerAcceptance)
    return { state: { ...state, lastBeltCommand: limit }, accepted: true, failureCode: null }
  }

  if (!Number.isSafeInteger(command.units) || command.units < 0) return deny(state, "INVALID_TRANSFER")
  const sourceValue = state[command.from]
  const targetValue = state[command.to]
  if (command.units > sourceValue) return deny(state, "SOURCE_UNDERFLOW")
  const cap = poolCapacity(command.to)
  if (cap !== null && targetValue + command.units > cap) return deny(state, "DESTINATION_OVERFLOW")

  let next = withPool(state, command.from, sourceValue - command.units)
  next = withPool(next, command.to, targetValue + command.units)
  return { state: next, accepted: true, failureCode: null }
}

export function canonicalWaterState(state: WaterState): string {
  const normalized = {
    aquifer: state.aquifer,
    failureCode: state.failureCode,
    groundwater: state.groundwater,
    halted: state.halted,
    inFlight: state.inFlight,
    lakePond: state.lakePond,
    lastBeltCommand: state.lastBeltCommand,
    lungReturn: state.lungReturn,
    ocean: state.ocean,
    pumpTrains: Object.fromEntries(Object.entries(state.pumpTrains).sort(([a], [b]) => a.localeCompare(b))),
    sectors: Object.fromEntries(Object.entries(state.sectors).sort(([a], [b]) => a.localeCompare(b))),
    shellOrder: state.shellOrder,
    tick: state.tick,
  }
  return JSON.stringify(normalized)
}

export function hashWaterState(state: WaterState): string {
  return crypto.createHash("sha256").update(canonicalWaterState(state)).digest("hex")
}

export function replayWaterCommands(initial: WaterState, commands: readonly WaterCommand[]): WaterState {
  let state = initial
  for (const command of commands) {
    const result = applyWaterCommand(state, command)
    state = result.state
    if (!result.accepted) break
  }
  return state
}

export const GEOMETRY = {
  common: {
    baseApothemKm: 1964.37,
    heightKm: 1964.37,
    worldRadiusKm: 1814.37,
    worldSurfaceDatumKm: 50,
    atmosphericTopKm: 150,
    beltTrenchDepthKm: 5,
    averageOceanFloorAboveBaseKm: 47,
    beltTrenchFloorAboveBaseKm: 45,
  },
  3: {
    sectorCount: 39, cellCount: CELLS[3], baseSideKm: 6804.78, circumradiusKm: 3928.74,
    maxSpanKm: 7857.48, baseAreaMillionKm2: 20.051, volumeBillionKm3: 13.129,
  },
  4: {
    sectorCount: 32, cellCount: CELLS[4], baseSideKm: 3928.74, circumradiusKm: 2778.04,
    maxSpanKm: 5556.08, baseAreaMillionKm2: 15.435, volumeBillionKm3: 10.107,
  },
  5: {
    sectorCount: 30, cellCount: CELLS[5], baseSideKm: 2854.40, circumradiusKm: 2428.09,
    maxSpanKm: 4856.19, baseAreaMillionKm2: 14.018, volumeBillionKm3: 9.179,
  },
} as const
