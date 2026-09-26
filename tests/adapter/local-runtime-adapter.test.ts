import { afterEach, describe, expect, it } from "vitest"
import type { Server } from "node:http"
import {
  GP_SCENARIO_IDS,
  LOCAL_RUNTIME_ADAPTER_001,
  startLocalRuntimeAdapter,
} from "../../src/adapter/local-runtime-adapter.js"

let server: Server | null = null

afterEach(async () => {
  if (!server) return
  const current = server
  server = null
  await new Promise<void>((resolve, reject) => {
    current.close(error => error ? reject(error) : resolve())
  })
})

async function start(): Promise<string> {
  const running = await startLocalRuntimeAdapter(0)
  server = running.server
  expect(running.host).toBe("127.0.0.1")
  return `http://127.0.0.1:${running.port}`
}

describe("LOCAL-RUNTIME-ADAPTER-001 — identity and exposure", () => {
  it("binds only to loopback and reports exact source identity", async () => {
    const base = await start()
    const response = await fetch(`${base}/health`)
    expect(response.status).toBe(200)
    expect(response.headers.get("x-fotn-adapter")).toBe("LOCAL-RUNTIME-ADAPTER-001")
    expect(await response.json()).toEqual({
      status: "ok",
      adapterId: "LOCAL-RUNTIME-ADAPTER-001",
      host: "127.0.0.1",
      qualifiedBaseCommit: "9e633eb1459b5cf0a00fcc9d58bdd15f69a27871",
      fixtureId: "GP-TEST-001",
    })
  })
  it("returns a stable GP-TEST-001 baseline hash and exact Water total", async () => {
    const base = await start()
    const a = await fetch(`${base}/gp-test-001/baseline`).then(r => r.json()) as any
    const b = await fetch(`${base}/gp-test-001/baseline`).then(r => r.json()) as any
    expect(a.fixtureId).toBe("GP-TEST-001")
    expect(a.totalWater).toBe(12_000_000)
    expect(a.hash).toBe(b.hash)
    expect(a.state).toEqual(b.state)
  })

  it("lists exactly the fourteen canonical scenarios", async () => {
    const base = await start()
    const payload = await fetch(`${base}/gp-test-001/scenarios`).then(r => r.json()) as any
    expect(payload.scenarios).toEqual(GP_SCENARIO_IDS)
    expect(payload.scenarios).toHaveLength(14)
  })

  it("does not expose an arbitrary command endpoint", async () => {
    const base = await start()
    const response = await fetch(`${base}/gp-test-001/commands`, {
      method: "POST",
      body: JSON.stringify({ type: "UNKNOWN" }),
      headers: { "content-type": "application/json" },
    })
    expect(response.status).toBe(404)
  })
})

describe("LOCAL-RUNTIME-ADAPTER-001 — canonical scenario surface", () => {
  for (const scenarioId of GP_SCENARIO_IDS) {
    it(`${scenarioId} reports PASS over localhost`, async () => {
      const base = await start()
      const response = await fetch(`${base}/gp-test-001/scenarios/${scenarioId}`, {
        method: "POST",
      })
      expect(response.status).toBe(200)
      const payload = await response.json() as any
      expect(payload.scenarioId).toBe(scenarioId)
      expect(payload.pass).toBe(true)
      expect(payload.baselineHash).toMatch(/^[a-f0-9]{64}$/)
      expect(payload.finalHash).toMatch(/^[a-f0-9]{64}$/)
    })
  }

  it("rejects GET on an execution route", async () => {
    const base = await start()
    const response = await fetch(`${base}/gp-test-001/scenarios/GPF-001`)
    expect(response.status).toBe(405)
    expect(await response.json()).toEqual({
      error: "METHOD_NOT_ALLOWED",
      allowed: ["POST"],
    })
  })

  it("rejects request bodies on scenario execution", async () => {
    const base = await start()
    const response = await fetch(`${base}/gp-test-001/scenarios/GPF-001`, {
      method: "POST",
      body: "{}",
      headers: { "content-type": "application/json" },
    })
    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({ error: "REQUEST_BODY_NOT_ALLOWED" })
  })
  it("rejects unknown scenarios", async () => {
    const base = await start()
    const response = await fetch(`${base}/gp-test-001/scenarios/GPF-999`, {
      method: "POST",
    })
    expect(response.status).toBe(404)
    expect(await response.json()).toEqual({ error: "SCENARIO_NOT_FOUND" })
  })

  it("rejects unknown routes", async () => {
    const base = await start()
    const response = await fetch(`${base}/not-a-route`)
    expect(response.status).toBe(404)
    expect(await response.json()).toEqual({ error: "NOT_FOUND" })
  })

  it("uses the locked loopback host constant", () => {
    expect(LOCAL_RUNTIME_ADAPTER_001.host).toBe("127.0.0.1")
  })
})
