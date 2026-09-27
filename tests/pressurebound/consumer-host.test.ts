import { createHash } from "node:crypto"
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterEach, describe, expect, it } from "vitest"
import type { Server } from "node:http"
import {
  inspectPressureboundBuild,
  type PressureboundBuildManifest,
} from "../../src/pressurebound-consumer/consumer-host.js"
import { startLocalRuntimeAdapter } from "../../src/adapter/local-runtime-adapter.js"

const roots: string[] = []
const servers: Server[] = []

afterEach(async () => {
  await Promise.all(servers.splice(0).map(server => new Promise<void>((resolve, reject) => {
    server.close(error => error ? reject(error) : resolve())
  })))
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true })
})

function digest(value: string): string {
  return createHash("sha256").update(Buffer.from(value)).digest("hex")
}
function fixture(): { root: string; manifest: PressureboundBuildManifest } {
  const root = mkdtempSync(join(tmpdir(), "fotn-pressurebound-consumer-"))
  roots.push(root)
  mkdirSync(join(root, "assets"), { recursive: true })

  const content = {
    "index.html": "<html><body><div id='root'></div><script src='/assets/game.js'></script></body></html>",
    "assets/game.js": [
      "fixture-deployment",
      "PRESSUREBOUND_PROTECTED_RULE_ENGINE_V1",
      "pressurebound:qualified-durable-save:v1",
    ].join("|"),
    "assets/game.css": "body{display:block}",
    "favicon.svg": "<svg></svg>",
    "robots.txt": "User-agent: *",
  }

  for (const [path, value] of Object.entries(content)) {
    writeFileSync(join(root, path), value)
  }

  const manifest: PressureboundBuildManifest = {
    consumerId: "PRESSUREBOUND-CONSUMER-TEST",
    sourceLabel: "fixture",
    deploymentId: "fixture-deployment",
    expectedMarkers: [],
    files: Object.entries(content).map(([path, value]) => ({
      path,
      bytes: Buffer.byteLength(value),
      sha256: digest(value),
    })),
  }
  return { root, manifest }
}
describe("PRESSUREBOUND consumer host", () => {
  it("verifies the complete bound build", () => {
    const { root, manifest } = fixture()
    const inspection = inspectPressureboundBuild(root, manifest)
    expect(inspection.ok).toBe(true)
    expect(inspection.verifiedFiles).toBe(5)
    expect(inspection.failures).toEqual([])
    expect(inspection.deploymentMarkerPresent).toBe(true)
    expect(inspection.protectedRuleMarkerPresent).toBe(true)
    expect(inspection.durableSaveMarkerPresent).toBe(true)
  })

  it("denies a drifted build", () => {
    const { root, manifest } = fixture()
    writeFileSync(join(root, "assets/game.css"), "body{display:none}")
    const inspection = inspectPressureboundBuild(root, manifest)
    expect(inspection.ok).toBe(false)
    expect(inspection.failures.some(x => x.startsWith("SIZE_MISMATCH:assets/game.css") ||
      x.startsWith("HASH_MISMATCH:assets/game.css"))).toBe(true)
  })

  it("serves the verified game and injects a runtime handshake", async () => {
    const { root, manifest } = fixture()
    const running = await startLocalRuntimeAdapter(0, {
      pressurebound: { root, manifest },
    })
    servers.push(running.server)
    const base = `http://127.0.0.1:${running.port}`

    const handshakeResponse = await fetch(`${base}/pressurebound/consumer/handshake`)
    expect(handshakeResponse.status).toBe(200)
    const handshake = await handshakeResponse.json() as any
    expect(handshake.status).toBe("ok")
    expect(handshake.buildVerified).toBe(true)
    expect(handshake.gameplayAuthority).toBe("BROWSER_BUNDLED_ENGINE_PRESERVED")
    expect(handshake.transitionAuthority).toBe("HELD_MATCHING_SOURCE_REQUIRED")
    const pageResponse = await fetch(`${base}/pressurebound/`)
    expect(pageResponse.status).toBe(200)
    expect(pageResponse.headers.get("x-pressurebound-consumer-injected")).toBe("true")
    const html = await pageResponse.text()
    expect(html).toContain("fotn-pressurebound-runtime-status")
    expect(html).toContain("LOCAL RUNTIME CONNECTED")

    const jsResponse = await fetch(`${base}/assets/game.js`)
    expect(jsResponse.status).toBe(200)
    expect(jsResponse.headers.get("x-pressurebound-source-sha256")).toBe(
      manifest.files.find(file => file.path === "assets/game.js")!.sha256,
    )
  })

  it("returns 503 rather than serving a drifted consumer build", async () => {
    const { root, manifest } = fixture()
    writeFileSync(join(root, "robots.txt"), "changed")
    const running = await startLocalRuntimeAdapter(0, {
      pressurebound: { root, manifest },
    })
    servers.push(running.server)
    const base = `http://127.0.0.1:${running.port}`

    const handshake = await fetch(`${base}/pressurebound/consumer/handshake`)
    expect(handshake.status).toBe(503)
    const page = await fetch(`${base}/pressurebound/`)
    expect(page.status).toBe(503)
  })
})
