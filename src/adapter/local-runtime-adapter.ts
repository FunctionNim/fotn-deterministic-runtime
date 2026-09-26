import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http"
import {
  GP_TEST_001,
  activePumpCapacity,
  activeReturnCapacity,
  applyGPCommand,
  createGPTest001Baseline,
  hashGPState,
  replayGPCommands,
  totalWater,
  type GPCommand,
  type GPTestState,
} from "../pyramid/gp-test-001.js"

export const LOCAL_RUNTIME_ADAPTER_001 = Object.freeze({
  adapterId: "LOCAL-RUNTIME-ADAPTER-001",
  host: "127.0.0.1",
  defaultPort: 24_701,
  qualifiedBaseCommit: "9e633eb1459b5cf0a00fcc9d58bdd15f69a27871",
  fixtureId: "GP-TEST-001",
} as const)

export const GP_SCENARIO_IDS = Object.freeze(
  Array.from({ length: 14 }, (_, i) => `GPF-${String(i + 1).padStart(3, "0")}`),
)

export interface GPScenarioResult {
  scenarioId: string
  pass: boolean
  baselineHash: string
  finalHash: string
  halted: boolean
  failureCode: string | null
  observations: Record<string, string | number | boolean | null>
}
function allocationTotal(state: GPTestState, fieldIndex = 0): number {
  return Object.values(state.anchorFields[fieldIndex].allocation).reduce((a, b) => a + b, 0)
}

function runCommands(commands: readonly GPCommand[]): GPTestState {
  return replayGPCommands(createGPTest001Baseline(), commands)
}

function result(
  scenarioId: string,
  final: GPTestState,
  pass: boolean,
  observations: GPScenarioResult["observations"],
): GPScenarioResult {
  const baseline = createGPTest001Baseline()
  return {
    scenarioId,
    pass,
    baselineHash: hashGPState(baseline),
    finalHash: hashGPState(final),
    halted: final.halted,
    failureCode: final.failureCode,
    observations,
  }
}

export function runGPScenario(scenarioId: string): GPScenarioResult {
  const baseline = createGPTest001Baseline()

  if (scenarioId === "GPF-001") {
    const field = baseline.anchorFields[0]
    const final = applyGPCommand(baseline, {
      type: "ISOLATE_ANCHOR",
      fieldId: field.id,
      anchorId: field.anchors[0].id,
    }).state
    return result(scenarioId, final,
      final.anchorFields[0].status === "NORMAL" && allocationTotal(final) === 1_000,
      { fieldStatus: final.anchorFields[0].status, allocatedLoad: allocationTotal(final) })
  }

  if (scenarioId === "GPF-002") {
    const field = baseline.anchorFields[0]
    const final = runCommands([
      { type: "ISOLATE_ANCHOR", fieldId: field.id, anchorId: field.anchors[0].id },
      { type: "ISOLATE_ANCHOR", fieldId: field.id, anchorId: field.anchors[1].id },
    ])
    return result(scenarioId, final,
      final.anchorFields[0].status === "DEGRADED" && final.anchorFields[0].load === 1_000,
      { fieldStatus: final.anchorFields[0].status, load: final.anchorFields[0].load })
  }

  if (scenarioId === "GPF-003") {
    const final = applyGPCommand(baseline, {
      type: "ISOLATE_PUMP", pumpId: "GP-PUMP-01",
    }).state
    const capacity = activePumpCapacity(final)
    return result(scenarioId, final,
      capacity === 12_000 && capacity > GP_TEST_001.normalWaterCommand,
      { activePumpCapacity: capacity, normalWaterCommand: GP_TEST_001.normalWaterCommand })
  }

  if (scenarioId === "GPF-004") {
    const final = applyGPCommand(baseline, {
      type: "ISOLATE_RETURN_ZONE", returnZoneId: "GP-RETURN-01",
    }).state
    const capacity = activeReturnCapacity(final)
    return result(scenarioId, final,
      capacity === 12_000 && capacity > GP_TEST_001.normalWaterCommand,
      { activeReturnCapacity: capacity, normalWaterCommand: GP_TEST_001.normalWaterCommand })
  }

  if (scenarioId === "GPF-005") {
    const final = applyGPCommand(baseline, {
      type: "ISOLATE_TRUNK", edgeId: "GP-EDGE-01", trunk: "A",
    }).state
    const edge = final.edges[0]
    return result(scenarioId, final,
      edge.served === 600 && edge.held === 400 && edge.served >= edge.criticalDemand,
      { served: edge.served, held: edge.held, criticalDemand: edge.criticalDemand })
  }

  if (scenarioId === "GPF-006") {
    const final = applyGPCommand(baseline, {
      type: "SET_SYMBOL_RED", sectorId: "GP-SYMBOL-01",
    }).state
    const local = final.symbols[0]
    const neighborsOnline = final.symbols.slice(1).every(s => s.online)
    return result(scenarioId, final,
      !local.online && local.thermalBand === "RED" && neighborsOnline,
      { localOnline: local.online, localBand: local.thermalBand, neighborsOnline })
  }

  if (scenarioId === "GPF-007") {
    const final = runCommands([
      { type: "SET_RESIDENT_HEAT", units: 600 },
      { type: "THERMAL_TICK" },
    ])
    return result(scenarioId, final,
      final.thermal.serviceBuffer === 140 && final.thermal.band === "AMBER",
      {
        reused: final.thermal.reused,
        returned: final.thermal.returned,
        buffer: final.thermal.serviceBuffer,
        band: final.thermal.band,
      })
  }

  if (scenarioId === "GPF-008") {
    const final = applyGPCommand(baseline, {
      type: "WATER_TRANSFER", from: "surface", to: "central", units: 600_001,
    }).state
    return result(scenarioId, final,
      final.halted && final.failureCode === "WATER_SOURCE_UNDERFLOW" &&
        totalWater(final) === GP_TEST_001.totalWater,
      { totalWater: totalWater(final), failureCode: final.failureCode })
  }

  if (scenarioId === "GPF-009") {
    const final = applyGPCommand(baseline, {
      type: "WATER_TRANSFER", from: "ocean", to: "central", units: 800_001,
    }).state
    return result(scenarioId, final,
      final.halted && final.failureCode === "WATER_DESTINATION_OVERFLOW" &&
        totalWater(final) === GP_TEST_001.totalWater,
      { totalWater: totalWater(final), failureCode: final.failureCode })
  }

  if (scenarioId === "GPF-010") {
    const final = applyGPCommand(baseline, {
      type: "ENERGY_TICK",
      energyIn: 999,
      usefulWork: 600,
      storedEnergyDelta: 100,
      heatGenerated: 200,
      energyReturned: 100,
    }).state
    return result(scenarioId, final,
      final.halted && final.failureCode === "ENERGY_IMBALANCE" &&
        final.energy.energyIn === 0,
      { failureCode: final.failureCode, energyInLedger: final.energy.energyIn })
  }

  if (scenarioId === "GPF-011") {
    const final = runCommands([
      {
        type: "ISOLATE_ANCHOR",
        fieldId: "GP-ANCHOR-FIELD-001",
        anchorId: "GP-ANCHOR-FIELD-001-ANCHOR-01",
      },
      { type: "ISOLATE_TRUNK", edgeId: "GP-EDGE-01", trunk: "A" },
      { type: "SET_SYMBOL_RED", sectorId: "GP-SYMBOL-01" },
      { type: "SET_RESIDENT_HEAT", units: 600 },
      { type: "THERMAL_TICK" },
    ])
    const pass =
      final.anchorFields[0].status === "NORMAL" &&
      final.edges[0].held === 400 &&
      !final.symbols[0].online &&
      final.thermal.band === "AMBER" &&
      totalWater(final) === GP_TEST_001.totalWater &&
      !final.halted
    return result(scenarioId, final, pass, {
      fieldStatus: final.anchorFields[0].status,
      heldPower: final.edges[0].held,
      symbolOnline: final.symbols[0].online,
      thermalBand: final.thermal.band,
      totalWater: totalWater(final),
    })
  }
  if (scenarioId === "GPF-012") {
    const commands: GPCommand[] = [
      { type: "ISOLATE_PUMP", pumpId: "GP-PUMP-01" },
      { type: "ISOLATE_RETURN_ZONE", returnZoneId: "GP-RETURN-01" },
      { type: "SET_RESIDENT_HEAT", units: 600 },
      { type: "THERMAL_TICK" },
    ]
    const a = replayGPCommands(createGPTest001Baseline(), commands)
    const b = replayGPCommands(createGPTest001Baseline(), commands)
    const equal = hashGPState(a) === hashGPState(b)
    return result(scenarioId, a, equal, {
      replayEqual: equal,
      comparisonHash: hashGPState(b),
    })
  }

  if (scenarioId === "GPF-013") {
    const baselineHash = hashGPState(baseline)
    const changed = runCommands([
      { type: "ISOLATE_PUMP", pumpId: "GP-PUMP-01" },
      { type: "SET_SYMBOL_RED", sectorId: "GP-SYMBOL-01" },
    ])
    const reset = createGPTest001Baseline()
    const pass = hashGPState(changed) !== baselineHash && hashGPState(reset) === baselineHash
    return result(scenarioId, reset, pass, {
      changedHashDifferent: hashGPState(changed) !== baselineHash,
      resetHashEqual: hashGPState(reset) === baselineHash,
    })
  }

  if (scenarioId === "GPF-014") {
    const baselineHash = hashGPState(baseline)
    const halted = runCommands([
      { type: "WATER_TRANSFER", from: "surface", to: "central", units: 600_001 },
      { type: "SET_RESIDENT_HEAT", units: 999 },
    ])
    const reset = createGPTest001Baseline()
    const pass = halted.halted && hashGPState(reset) === baselineHash
    return result(scenarioId, reset, pass, {
      haltedBeforeReset: halted.halted,
      haltedFailureCode: halted.failureCode,
      resetHashEqual: hashGPState(reset) === baselineHash,
    })
  }

  throw new Error(`Unknown GP scenario: ${scenarioId}`)
}

function sendJson(response: ServerResponse, status: number, payload: unknown): void {
  const body = JSON.stringify(payload)
  response.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "content-length": Buffer.byteLength(body),
    "cache-control": "no-store",
    "x-fotn-adapter": LOCAL_RUNTIME_ADAPTER_001.adapterId,
  })
  response.end(body)
}

function rejectBody(request: IncomingMessage, response: ServerResponse): boolean {
  const length = Number(request.headers["content-length"] ?? "0")
  if (Number.isFinite(length) && length > 0) {
    sendJson(response, 400, { error: "REQUEST_BODY_NOT_ALLOWED" })
    return true
  }
  return false
}
export function createLocalRuntimeAdapterServer(): Server {
  return createServer((request, response) => {
    const method = request.method ?? "GET"
    const url = new URL(request.url ?? "/", "http://127.0.0.1")

    if (method === "GET" && url.pathname === "/health") {
      sendJson(response, 200, {
        status: "ok",
        adapterId: LOCAL_RUNTIME_ADAPTER_001.adapterId,
        host: LOCAL_RUNTIME_ADAPTER_001.host,
        qualifiedBaseCommit: LOCAL_RUNTIME_ADAPTER_001.qualifiedBaseCommit,
        fixtureId: LOCAL_RUNTIME_ADAPTER_001.fixtureId,
      })
      return
    }

    if (method === "GET" && url.pathname === "/gp-test-001/baseline") {
      const state = createGPTest001Baseline()
      sendJson(response, 200, {
        fixtureId: state.fixtureId,
        hash: hashGPState(state),
        totalWater: totalWater(state),
        state,
      })
      return
    }

    if (method === "GET" && url.pathname === "/gp-test-001/scenarios") {
      sendJson(response, 200, { scenarios: GP_SCENARIO_IDS })
      return
    }

    const match = url.pathname.match(/^\/gp-test-001\/scenarios\/(GPF-\d{3})$/)
    if (match) {
      if (method !== "POST") {
        sendJson(response, 405, { error: "METHOD_NOT_ALLOWED", allowed: ["POST"] })
        return
      }
      if (rejectBody(request, response)) return
      if (!GP_SCENARIO_IDS.includes(match[1])) {
        sendJson(response, 404, { error: "SCENARIO_NOT_FOUND" })
        return
      }
      sendJson(response, 200, runGPScenario(match[1]))
      return
    }

    sendJson(response, 404, { error: "NOT_FOUND" })
  })
}

export async function startLocalRuntimeAdapter(
  port: number = LOCAL_RUNTIME_ADAPTER_001.defaultPort,
): Promise<{ server: Server; host: string; port: number }> {
  const server = createLocalRuntimeAdapterServer()
  await new Promise<void>((resolve, reject) => {
    server.once("error", reject)
    server.listen(port, LOCAL_RUNTIME_ADAPTER_001.host, () => resolve())
  })
  const address = server.address()
  if (!address || typeof address === "string") {
    server.close()
    throw new Error("Adapter failed to obtain TCP address")
  }
  if (address.address !== LOCAL_RUNTIME_ADAPTER_001.host) {
    server.close()
    throw new Error(`Adapter bound unexpected address: ${address.address}`)
  }
  return { server, host: address.address, port: address.port }
}
