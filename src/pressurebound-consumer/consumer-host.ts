import { createHash } from "node:crypto"
import { existsSync, readFileSync, statSync } from "node:fs"
import { join, normalize } from "node:path"

export interface PressureboundBuildFile {
  path: string
  bytes: number
  sha256: string
}

export interface PressureboundBuildManifest {
  consumerId: string
  sourceLabel: string
  deploymentId: string
  expectedMarkers: readonly string[]
  files: readonly PressureboundBuildFile[]
}

export const PRESSUREBOUND_CONSUMER_001: PressureboundBuildManifest = Object.freeze({
  consumerId: "PRESSUREBOUND-CONSUMER-001",
  sourceLabel: "PRESSUREBOUND Local — 2026-09-23 verified static build",
  deploymentId: "1e7065ec-8bd9-481b-bacf-f812810efae0",
  expectedMarkers: Object.freeze([
    "1e7065ec-8bd9-481b-bacf-f812810efae0",
    "PRESSUREBOUND_PROTECTED_RULE_ENGINE_V1",
    "pressurebound:qualified-durable-save:v1",
  ]),
  files: Object.freeze([
    {
      path: "assets/index-BReWkrRU.css",
      bytes: 108_515,
      sha256: "8be4ea3ed261a26b5ca94cafa07cc0293a57e50516324bbda1104f35d302ad2c",
    },
    {
      path: "assets/index-D1PxQTgs.js",
      bytes: 487_967,
      sha256: "824cfb5710df514a64d3a1f2202ada356e34a0b8fb70b9dec49ad00677a8d178",
    },
    {
      path: "favicon.svg",
      bytes: 163,
      sha256: "8ffbde9092b1fa4de97c9481b76f518b131268c82e7c555041925225b1dab6e0",
    },
    {
      path: "index.html",
      bytes: 1_140,
      sha256: "4194f6e0b4a442198faf93ebf1f2d2de35a6134a058ce75f5a29d04714ca9abc",
    },
    {
      path: "robots.txt",
      bytes: 23,
      sha256: "16ceb5ee3e0dc13aa9adf31a3ebbe45a1d965b8c2b9f72eaf84e5911e140ed95",
    },
  ]),
})
export interface PressureboundBuildInspection {
  ok: boolean
  root: string
  failures: string[]
  verifiedFiles: number
  deploymentMarkerPresent: boolean
  protectedRuleMarkerPresent: boolean
  durableSaveMarkerPresent: boolean
}

export interface PressureboundConsumerOptions {
  root?: string
  manifest?: PressureboundBuildManifest
}

export interface PressureboundHostedAsset {
  status: number
  contentType: string
  body: Buffer
  originalSha256?: string
  injected?: boolean
}

function sha256(data: Buffer): string {
  return createHash("sha256").update(data).digest("hex")
}

export function resolvePressureboundWebRoot(explicit?: string): string {
  return explicit ??
    process.env.FOTN_PRESSUREBOUND_WEB_ROOT ??
    join(process.cwd(), "pressurebound-web")
}
export function inspectPressureboundBuild(
  root: string,
  manifest: PressureboundBuildManifest = PRESSUREBOUND_CONSUMER_001,
): PressureboundBuildInspection {
  const failures: string[] = []
  let verifiedFiles = 0

  for (const entry of manifest.files) {
    const full = join(root, entry.path)
    if (!existsSync(full)) {
      failures.push(`MISSING:${entry.path}`)
      continue
    }
    const stat = statSync(full)
    if (!stat.isFile()) {
      failures.push(`NOT_FILE:${entry.path}`)
      continue
    }
    if (stat.size !== entry.bytes) {
      failures.push(`SIZE_MISMATCH:${entry.path}:${stat.size}`)
      continue
    }
    const actual = sha256(readFileSync(full))
    if (actual !== entry.sha256) {
      failures.push(`HASH_MISMATCH:${entry.path}:${actual}`)
      continue
    }
    verifiedFiles += 1
  }

  const bundleEntry = manifest.files.find(entry => entry.path.endsWith(".js"))
  const bundle = bundleEntry && existsSync(join(root, bundleEntry.path))
    ? readFileSync(join(root, bundleEntry.path), "utf8")
    : ""
  const deploymentMarkerPresent = bundle.includes(manifest.deploymentId)
  const protectedRuleMarkerPresent = bundle.includes("PRESSUREBOUND_PROTECTED_RULE_ENGINE_V1")
  const durableSaveMarkerPresent = bundle.includes("pressurebound:qualified-durable-save:v1")

  if (!deploymentMarkerPresent) failures.push("DEPLOYMENT_MARKER_MISSING")
  if (!protectedRuleMarkerPresent) failures.push("PROTECTED_RULE_MARKER_MISSING")
  if (!durableSaveMarkerPresent) failures.push("DURABLE_SAVE_MARKER_MISSING")

  return {
    ok: failures.length === 0,
    root,
    failures,
    verifiedFiles,
    deploymentMarkerPresent,
    protectedRuleMarkerPresent,
    durableSaveMarkerPresent,
  }
}

const integrationScript = String.raw`
<script>
(() => {
  const id = 'fotn-pressurebound-runtime-status';
  const badge = document.createElement('div');
  badge.id = id;
  badge.setAttribute('role', 'status');
  badge.style.cssText = [
    'position:fixed','right:12px','bottom:12px','z-index:2147483647',
    'padding:7px 10px','border:1px solid rgba(255,255,255,.28)',
    'background:rgba(10,14,18,.88)','color:#fff','font:11px/1.3 monospace',
    'letter-spacing:.08em','text-transform:uppercase','border-radius:4px',
    'box-shadow:0 4px 18px rgba(0,0,0,.35)'
  ].join(';');
  badge.textContent = 'LOCAL RUNTIME CHECKING';
  document.addEventListener('DOMContentLoaded', () => document.body.appendChild(badge), { once: true });
  fetch('/pressurebound/consumer/handshake', { cache: 'no-store' })
    .then(response => response.ok ? response.json() : Promise.reject(new Error('handshake')))
    .then(data => {
      window.__FOTN_PRESSUREBOUND_CONSUMER__ = data;
      badge.textContent = data.buildVerified ? 'LOCAL RUNTIME CONNECTED' : 'RUNTIME BUILD HOLD';
      badge.title = data.gameplayAuthority + ' / ' + data.transitionAuthority;
    })
    .catch(() => {
      badge.textContent = 'LOCAL RUNTIME OFFLINE';
      badge.style.borderColor = 'rgba(255,80,80,.8)';
    });
})();
</script>
`

export function injectPressureboundConsumerHandshake(html: string): string {
  const closing = html.lastIndexOf("</body>")
  if (closing < 0) return html + integrationScript
  return html.slice(0, closing) + integrationScript + html.slice(closing)
}

function contentTypeFor(path: string): string {
  if (path.endsWith(".html")) return "text/html; charset=utf-8"
  if (path.endsWith(".js")) return "text/javascript; charset=utf-8"
  if (path.endsWith(".css")) return "text/css; charset=utf-8"
  if (path.endsWith(".svg")) return "image/svg+xml"
  if (path.endsWith(".txt")) return "text/plain; charset=utf-8"
  return "application/octet-stream"
}
function requestedManifestPath(pathname: string): string | null {
  if (pathname === "/pressurebound" || pathname === "/pressurebound/") return "index.html"
  if (pathname === "/favicon.svg") return "favicon.svg"
  if (pathname === "/robots.txt") return "robots.txt"
  if (pathname.startsWith("/assets/")) return pathname.slice(1)
  return null
}

export function readPressureboundHostedAsset(
  pathname: string,
  options: PressureboundConsumerOptions = {},
): PressureboundHostedAsset | null {
  const manifest = options.manifest ?? PRESSUREBOUND_CONSUMER_001
  const root = resolvePressureboundWebRoot(options.root)
  const relative = requestedManifestPath(pathname)
  if (!relative) return null

  const entry = manifest.files.find(file => file.path === relative)
  if (!entry) return null

  const inspection = inspectPressureboundBuild(root, manifest)
  if (!inspection.ok) {
    return {
      status: 503,
      contentType: "application/json; charset=utf-8",
      body: Buffer.from(JSON.stringify({
        error: "PRESSUREBOUND_BUILD_VERIFICATION_FAILED",
        failures: inspection.failures,
      })),
    }
  }

  const full = normalize(join(root, relative))
  const original = readFileSync(full)
  if (relative === "index.html") {
    const injected = injectPressureboundConsumerHandshake(original.toString("utf8"))
    return {
      status: 200,
      contentType: contentTypeFor(relative),
      body: Buffer.from(injected),
      originalSha256: entry.sha256,
      injected: true,
    }
  }
  return {
    status: 200,
    contentType: contentTypeFor(relative),
    body: original,
    originalSha256: entry.sha256,
    injected: false,
  }
}

export function pressureboundConsumerHandshake(
  options: PressureboundConsumerOptions = {},
): Record<string, unknown> {
  const manifest = options.manifest ?? PRESSUREBOUND_CONSUMER_001
  const root = resolvePressureboundWebRoot(options.root)
  const inspection = inspectPressureboundBuild(root, manifest)
  return {
    status: inspection.ok ? "ok" : "hold",
    consumerId: manifest.consumerId,
    buildVerified: inspection.ok,
    verifiedFiles: inspection.verifiedFiles,
    deploymentId: manifest.deploymentId,
    gameplayAuthority: "BROWSER_BUNDLED_ENGINE_PRESERVED",
    transitionAuthority: "HELD_MATCHING_SOURCE_REQUIRED",
    runtimeConnection: "LOCALHOST_SAME_ORIGIN",
    localOnly: true,
    sourceLabel: manifest.sourceLabel,
    failures: inspection.failures,
  }
}
