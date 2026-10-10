import { createHash } from "node:crypto"
import {
  recoveryCanonicalJson,
  type RecoveryCheckpoint,
  type VerifiedRecoveryCandidate,
} from "./posix-secret-engine-recovery-envelope.js"
import {
  RECOVERY_STORE_SCHEMA_VERSION,
  type LocalTempRecoveryStore,
  type RecoveryStoreCode,
  type RecoveryStoreObservedHead,
  type RecoveryStoreResult,
} from "./posix-secret-engine-local-temp-recovery-store.js"
import type { InterfaceRuntimeState } from "./posix-secret-engine-interface.js"
import type { RuntimeSignature } from "../runtime-signature/runtime-signature.js"

export const PERSISTED_RESTART_SCHEMA_VERSION = "POSIX-SE-PERSISTED-RESTART-1.0" as const
export const PERSISTED_RESTART_PACKET_CANONICAL_VERSION = "POSIX-SE-RESTART-PACKET-CANONICAL-1" as const

export type PersistedRestartCode =
  | "RESTART-READY-CANDIDATE"
  | "RESTART-HOLD-CHECKPOINT-REQUIRED"
  | "RESTART-HOLD-LOCAL-INTEGRITY-ONLY"
  | "RESTART-HOLD-UNSUPPORTED-SCHEMA"
  | "RESTART-HOLD-BASELINE"
  | "RESTART-INVALID-STORE-EVIDENCE"
  | "RESTART-INVALID-SIGNATURE-EVIDENCE"
  | "RESTART-INVALID-PACKET-HASH"
  | "RESTART-INVALID-PACKET"
  | "RESTART-CONFLICT-CHECKPOINT"
  | "RESTART-CONFLICT-CANDIDATE"
  | "RESTART-CONFLICT-ANCESTRY"
  | "RESTART-CONFLICT-STATE"
  | "RESTART-CONFLICT-DETERMINISM"
  | "RESTART-REFUSE-LIVE-ID"
  | "RESTART-REFUSE-INSTALLATION"
  | "RESTART-REFUSE-STORE-MUTATION"
  | "RESTART-REFUSE-SOURCE-MUTATION"
  | "RESTART-REFUSE-PATH"
  | "RESTART-HOLD-ORPHAN-STAGING"
  | "RESTART-CONFLICT-STORE-CHAIN"

export interface PersistedRestartInput {
  readonly schemaVersion?: typeof PERSISTED_RESTART_SCHEMA_VERSION
  readonly restartSessionId: string
  readonly expectedCheckpoint: RecoveryCheckpoint
  readonly createdAt: string | "UNKNOWN"
  readonly allowedRuntimeArtifactRefs: readonly string[]
}

export interface RestartCandidatePacketBody {
  readonly schemaVersion: typeof PERSISTED_RESTART_SCHEMA_VERSION
  readonly canonicalVersion: typeof PERSISTED_RESTART_PACKET_CANONICAL_VERSION
  readonly restartSessionId: string
  readonly sourceStoreSchemaVersion: typeof RECOVERY_STORE_SCHEMA_VERSION
  readonly sourceCheckpoint: RecoveryCheckpoint
  readonly envelopeId: string
  readonly sequence: number
  readonly runtimeArtifactRef: string
  readonly stateSnapshot: InterfaceRuntimeState
  readonly runtimeSignature: RuntimeSignature
  readonly ancestry: readonly string[]
  readonly createdAt: string | "UNKNOWN"
  readonly boundaries: readonly [
    "NON_PRODUCTION_ONLY",
    "NO_RUNTIME_INSTALL",
    "SOURCE_MUTATION_NONE",
    "CHECKPOINT_REQUIRED",
  ]
}

export interface RestartCandidatePacket extends RestartCandidatePacketBody {
  readonly packetHash: string
}

export interface PersistedRestartResult {
  readonly code: PersistedRestartCode
  readonly effect: "NONE"
  readonly packet?: RestartCandidatePacket
  readonly detail?: string
}

export type PersistedRestartStoreReader = Pick<LocalTempRecoveryStore, "loadVerifiedChain">

const REQUIRED_BOUNDARIES = [
  "NON_PRODUCTION_ONLY",
  "NO_RUNTIME_INSTALL",
  "SOURCE_MUTATION_NONE",
  "CHECKPOINT_REQUIRED",
] as const

const FORBIDDEN_INPUT_KEYS = new Set([
  "activeruntime",
  "interfaceruntimestate",
  "installstate",
  "setstate",
  "replacestate",
  "restorestate",
  "loadandinstall",
  "resume",
  "resumecommand",
  "reconcile",
  "admit",
  "autoadmit",
  "bindseed",
  "evaluateroute",
  "commitroute",
  "routecommand",
  "autoroute",
  "return",
  "append",
  "delete",
  "cleanup",
  "repair",
  "sourcemutation",
  "network",
  "database",
  "cloud",
  "sharedbackend",
])

function deepFreeze<T>(value: T): T {
  if (value !== null && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value)
    for (const child of Object.values(value as Record<string, unknown>)) deepFreeze(child)
  }
  return value
}

function normalizedKey(key: string): string {
  return key.toLowerCase().replace(/[^a-z0-9]/g, "")
}

function containsForbiddenKey(value: unknown): string | undefined {
  if (value === null || typeof value !== "object") return undefined
  if (Array.isArray(value)) {
    for (const child of value) {
      const found = containsForbiddenKey(child)
      if (found) return found
    }
    return undefined
  }

  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    const normalized = normalizedKey(key)
    if (FORBIDDEN_INPUT_KEYS.has(normalized)) return key
    const nested = containsForbiddenKey(child)
    if (nested) return nested
  }
  return undefined
}

function fail(code: PersistedRestartCode, detail: string): PersistedRestartResult {
  return { code, effect: "NONE", detail }
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value)
}

function isCheckpoint(value: unknown): value is RecoveryCheckpoint {
  return isPlainRecord(value) &&
    Number.isInteger(value.sequence) &&
    typeof value.sequence === "number" &&
    value.sequence >= 0 &&
    typeof value.envelopeHash === "string" &&
    /^[0-9a-f]{64}$/.test(value.envelopeHash)
}

function parseInput(raw: unknown): PersistedRestartResult | PersistedRestartInput {
  if (!isPlainRecord(raw)) {
    return fail("RESTART-INVALID-PACKET", "Persisted restart input must be a plain object")
  }

  const forbidden = containsForbiddenKey(raw)
  if (forbidden) {
    if (normalizedKey(forbidden) === "sourcemutation") {
      return fail("RESTART-REFUSE-SOURCE-MUTATION", `Forbidden source-mutation field present: ${forbidden}`)
    }
    if (["append", "delete", "cleanup", "repair"].includes(normalizedKey(forbidden))) {
      return fail("RESTART-REFUSE-STORE-MUTATION", `Forbidden store-mutation field present: ${forbidden}`)
    }
    return fail("RESTART-REFUSE-INSTALLATION", `Forbidden runtime/install/backend field present: ${forbidden}`)
  }

  const schemaVersion = raw.schemaVersion ?? PERSISTED_RESTART_SCHEMA_VERSION
  if (schemaVersion !== PERSISTED_RESTART_SCHEMA_VERSION) {
    return fail("RESTART-HOLD-UNSUPPORTED-SCHEMA", "Unsupported persisted-restart schema")
  }

  if (typeof raw.restartSessionId !== "string" || !raw.restartSessionId.startsWith("TEST-RESTART-") ||
      raw.restartSessionId.length <= "TEST-RESTART-".length) {
    return fail("RESTART-REFUSE-LIVE-ID", "Persisted restart accepts TEST-RESTART-* identities only")
  }

  if (!("expectedCheckpoint" in raw) || raw.expectedCheckpoint === undefined || raw.expectedCheckpoint === null) {
    return fail("RESTART-HOLD-CHECKPOINT-REQUIRED", "External expectedCheckpoint is required")
  }
  if (!isCheckpoint(raw.expectedCheckpoint)) {
    return fail("RESTART-CONFLICT-CHECKPOINT", "expectedCheckpoint must contain a nonnegative sequence and 64-hex envelopeHash")
  }

  if (typeof raw.createdAt !== "string" || raw.createdAt.length === 0) {
    return fail("RESTART-INVALID-PACKET", "createdAt must be caller-supplied fixed text or UNKNOWN")
  }

  if (!Array.isArray(raw.allowedRuntimeArtifactRefs) ||
      raw.allowedRuntimeArtifactRefs.length === 0 ||
      raw.allowedRuntimeArtifactRefs.some(value => typeof value !== "string" || value.length === 0)) {
    return fail("RESTART-HOLD-BASELINE", "Explicit allowedRuntimeArtifactRefs policy is required")
  }

  return {
    schemaVersion: PERSISTED_RESTART_SCHEMA_VERSION,
    restartSessionId: raw.restartSessionId,
    expectedCheckpoint: {
      sequence: raw.expectedCheckpoint.sequence,
      envelopeHash: raw.expectedCheckpoint.envelopeHash,
    },
    createdAt: raw.createdAt,
    allowedRuntimeArtifactRefs: [...raw.allowedRuntimeArtifactRefs] as string[],
  }
}

function checkpointMatches(
  observedHead: RecoveryStoreObservedHead | undefined,
  expectedCheckpoint: RecoveryCheckpoint,
): boolean {
  return observedHead?.sequence === expectedCheckpoint.sequence &&
    observedHead.envelopeHash === expectedCheckpoint.envelopeHash
}

function candidateLooksComplete(candidate: VerifiedRecoveryCandidate | undefined): candidate is VerifiedRecoveryCandidate {
  return Boolean(
    candidate &&
    typeof candidate.envelopeId === "string" &&
    candidate.envelopeId.startsWith("TEST-RECOVERY-") &&
    Number.isInteger(candidate.sequence) &&
    candidate.sequence >= 0 &&
    typeof candidate.runtimeArtifactRef === "string" &&
    candidate.stateSnapshot &&
    candidate.runtimeSignature &&
    Array.isArray(candidate.ancestry) &&
    candidate.ancestry.length > 0,
  )
}

function mapStoreResult(storeResult: RecoveryStoreResult): PersistedRestartResult {
  const code: RecoveryStoreCode = storeResult.code
  switch (code) {
    case "STORE-LOCAL-INTEGRITY-ONLY":
      return fail("RESTART-HOLD-LOCAL-INTEGRITY-ONLY", storeResult.detail ?? "Store verified local integrity only")
    case "STORE-HOLD-BASELINE":
      return fail("RESTART-HOLD-BASELINE", storeResult.detail ?? "Runtime baseline is not allowed")
    case "STORE-HOLD-UNSUPPORTED-SCHEMA":
      return fail("RESTART-INVALID-STORE-EVIDENCE", storeResult.detail ?? "Underlying store schema is unsupported")
    case "STORE-HOLD-ORPHAN-STAGING":
      return fail("RESTART-HOLD-ORPHAN-STAGING", storeResult.detail ?? "Underlying store contains orphan staging evidence")
    case "STORE-CONFLICT-CHECKPOINT":
      return fail("RESTART-CONFLICT-CHECKPOINT", storeResult.detail ?? "Store head differs from external checkpoint")
    case "STORE-CONFLICT-FORK":
    case "STORE-CONFLICT-SEQUENCE":
    case "STORE-CONFLICT-PREV-HASH":
    case "STORE-CONFLICT-CHAIN":
    case "STORE-CONFLICT-SLOT":
    case "STORE-CONFLICT-HEAD-CHANGED":
      return fail("RESTART-CONFLICT-STORE-CHAIN", storeResult.detail ?? code)
    case "STORE-INVALID-RECORD":
    case "STORE-INVALID-READBACK":
      return fail("RESTART-INVALID-STORE-EVIDENCE", storeResult.detail ?? code)
    case "STORE-REFUSE-LIVE-ID":
      return fail("RESTART-REFUSE-LIVE-ID", storeResult.detail ?? "Underlying store refused live identity")
    case "STORE-REFUSE-PATH":
      return fail("RESTART-REFUSE-PATH", storeResult.detail ?? "Underlying store path refused")
    case "STORE-REFUSE-AUTO-RECOVERY":
    case "STORE-REFUSE-HISTORY-MUTATION":
      return fail("RESTART-REFUSE-INSTALLATION", storeResult.detail ?? code)
    case "STORE-REFUSE-SOURCE-MUTATION":
      return fail("RESTART-REFUSE-SOURCE-MUTATION", storeResult.detail ?? "Underlying store refused source mutation")
    case "STORE-OK-STORED":
    case "STORE-OK-ALREADY-STORED":
      return fail("RESTART-INVALID-STORE-EVIDENCE", "Reload unexpectedly received an append result")
    case "STORE-VALID-CANDIDATE":
      return fail("RESTART-CONFLICT-CANDIDATE", "Valid store result requires restart candidate processing")
  }
}

function packetBody(
  input: PersistedRestartInput,
  candidate: VerifiedRecoveryCandidate,
): RestartCandidatePacketBody {
  return {
    schemaVersion: PERSISTED_RESTART_SCHEMA_VERSION,
    canonicalVersion: PERSISTED_RESTART_PACKET_CANONICAL_VERSION,
    restartSessionId: input.restartSessionId,
    sourceStoreSchemaVersion: RECOVERY_STORE_SCHEMA_VERSION,
    sourceCheckpoint: structuredClone(input.expectedCheckpoint),
    envelopeId: candidate.envelopeId,
    sequence: candidate.sequence,
    runtimeArtifactRef: candidate.runtimeArtifactRef,
    stateSnapshot: structuredClone(candidate.stateSnapshot),
    runtimeSignature: structuredClone(candidate.runtimeSignature),
    ancestry: [
      ...candidate.ancestry,
      `restartAttempt:${input.restartSessionId}`,
      `checkpoint:${input.expectedCheckpoint.sequence}:${input.expectedCheckpoint.envelopeHash}`,
    ],
    createdAt: input.createdAt,
    boundaries: [...REQUIRED_BOUNDARIES],
  }
}

export function persistedRestartPacketHash(body: RestartCandidatePacketBody): string {
  return createHash("sha256")
    .update(recoveryCanonicalJson(body))
    .digest("hex")
}

function createPacket(
  input: PersistedRestartInput,
  candidate: VerifiedRecoveryCandidate,
): RestartCandidatePacket {
  const body = packetBody(input, candidate)
  return deepFreeze({
    ...body,
    packetHash: persistedRestartPacketHash(body),
  })
}

export function verifyRestartCandidatePacket(packet: RestartCandidatePacket): PersistedRestartResult {
  if (packet.schemaVersion !== PERSISTED_RESTART_SCHEMA_VERSION ||
      packet.canonicalVersion !== PERSISTED_RESTART_PACKET_CANONICAL_VERSION) {
    return fail("RESTART-HOLD-UNSUPPORTED-SCHEMA", "Restart packet schema/canonical version is unsupported")
  }
  if (!packet.restartSessionId.startsWith("TEST-RESTART-")) {
    return fail("RESTART-REFUSE-LIVE-ID", "Restart packet carries non-test identity")
  }
  if (!REQUIRED_BOUNDARIES.every(boundary => packet.boundaries.includes(boundary))) {
    return fail("RESTART-REFUSE-INSTALLATION", "Restart packet is missing no-install/non-production boundaries")
  }
  const { packetHash, ...body } = packet
  if (persistedRestartPacketHash(body) !== packetHash) {
    return fail("RESTART-INVALID-PACKET-HASH", "Restart packet SHA-256 digest does not match canonical packet body")
  }
  if (!Object.isFrozen(packet) || !Object.isFrozen(packet.stateSnapshot) || !Object.isFrozen(packet.runtimeSignature)) {
    return fail("RESTART-INVALID-PACKET", "Restart packet must be deeply immutable")
  }
  return { code: "RESTART-READY-CANDIDATE", effect: "NONE", packet }
}

export async function preparePersistedRestart(
  store: PersistedRestartStoreReader,
  rawInput: unknown,
): Promise<PersistedRestartResult> {
  const parsed = parseInput(rawInput)
  if ("code" in parsed) return parsed

  let storeResult: RecoveryStoreResult
  try {
    storeResult = await store.loadVerifiedChain(parsed.expectedCheckpoint)
  } catch {
    return fail("RESTART-INVALID-STORE-EVIDENCE", "Promoted recovery store load failed")
  }

  if (storeResult.code !== "STORE-VALID-CANDIDATE") return mapStoreResult(storeResult)

  if (!checkpointMatches(storeResult.observedHead, parsed.expectedCheckpoint) ||
      !candidateLooksComplete(storeResult.candidate)) {
    return fail("RESTART-CONFLICT-CANDIDATE", "Checkpoint-matched store result lacks a matching complete candidate/head")
  }

  const candidate = storeResult.candidate
  if (candidate.sequence !== parsed.expectedCheckpoint.sequence) {
    return fail("RESTART-CONFLICT-ANCESTRY", "Candidate sequence differs from expected checkpoint sequence")
  }
  if (!parsed.allowedRuntimeArtifactRefs.includes(candidate.runtimeArtifactRef)) {
    return fail("RESTART-HOLD-BASELINE", "Candidate runtimeArtifactRef is outside explicit restart policy")
  }

  if (typeof candidate.runtimeSignature.combinedHash !== "string" ||
      candidate.runtimeSignature.combinedHash.length === 0) {
    return fail("RESTART-INVALID-SIGNATURE-EVIDENCE", "Historical runtime signature evidence is missing")
  }

  const packet = createPacket(parsed, candidate)
  const verifiedPacket = verifyRestartCandidatePacket(packet)
  if (verifiedPacket.code !== "RESTART-READY-CANDIDATE") return verifiedPacket

  return {
    code: "RESTART-READY-CANDIDATE",
    effect: "NONE",
    packet,
  }
}
