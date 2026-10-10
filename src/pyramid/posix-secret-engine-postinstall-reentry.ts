import { createHash } from "node:crypto"
import {
  __dispatchSyntheticRestartTargetCommandForReentry,
  isPromotedSyntheticRestartInstallTarget,
  restartInstallStateFingerprint,
  SyntheticRestartInstallTarget,
  type RestartInstallReceipt,
  type RestartInstallTargetSnapshot,
  type RestartReentryOrdinaryCommand,
} from "./posix-secret-engine-restart-install-gate.js"
import { recoveryCanonicalJson } from "./posix-secret-engine-recovery-envelope.js"
import type { InterfaceRuntimeState, MachineCode } from "./posix-secret-engine-interface.js"

export const POSTINSTALL_REENTRY_SCHEMA_VERSION =
  "POSIX-SE-POSTINSTALL-REENTRY-1.0" as const

export type PostInstallReentryCode =
  | "REENTRY-OK-APPLIED"
  | "REENTRY-OK-ALREADY-APPLIED"
  | "REENTRY-HOLD-UNSUPPORTED-SCHEMA"
  | "REENTRY-HOLD-INSTALL-ROOT"
  | "REENTRY-HOLD-INSTALL-UNKNOWN"
  | "REENTRY-HOLD-CURRENT-STATE-REQUIRED"
  | "REENTRY-CONFLICT-CURRENT-STATE"
  | "REENTRY-CONFLICT-SESSION-STALE"
  | "REENTRY-CONFLICT-COMMAND"
  | "REENTRY-CONFLICT-ANCESTRY"
  | "REENTRY-CONFLICT-DETERMINISM"
  | "REENTRY-INVALID-TARGET"
  | "REENTRY-INVALID-COMMAND"
  | "REENTRY-INVALID-RECEIPT"
  | "REENTRY-REFUSE-LIVE-ID"
  | "REENTRY-REFUSE-COMMAND"
  | "REENTRY-REFUSE-HISTORICAL-REPLAY"
  | "REENTRY-REFUSE-AUTO-PROCESS"
  | "REENTRY-REFUSE-STORE-MUTATION"
  | "REENTRY-REFUSE-SOURCE-MUTATION"

export interface PostInstallReentryOpenInput {
  readonly schemaVersion?: typeof POSTINSTALL_REENTRY_SCHEMA_VERSION
  readonly sessionId: string
  readonly openedAt: string | "UNKNOWN"
}

export interface PostInstallReentryCommandInput {
  readonly schemaVersion?: typeof POSTINSTALL_REENTRY_SCHEMA_VERSION
  readonly commandId: string
  readonly expectedCurrentStateFingerprint: string
  readonly command: RestartReentryOrdinaryCommand
  readonly recordedAt: string | "UNKNOWN"
}

export interface PostInstallReentryReceiptBody {
  readonly schemaVersion: typeof POSTINSTALL_REENTRY_SCHEMA_VERSION
  readonly sessionId: string
  readonly commandId: string
  readonly commandType: RestartReentryOrdinaryCommand["type"]
  readonly commandBodyHash: string
  readonly targetRuntimeId: string
  readonly rootInstallOperationId: string
  readonly rootInstallOperationBodyHash: string
  readonly candidatePacketHash: string
  readonly restartSessionId: string
  readonly envelopeId: string
  readonly sourceCheckpoint: {
    readonly sequence: number
    readonly envelopeHash: string
  }
  readonly parentReceiptHash: string
  readonly beforeFingerprint: string
  readonly machineCode: MachineCode
  readonly engineEffect: "NONE" | "ENGINE_LOCAL"
  readonly afterFingerprint: string
  readonly recordedAt: string | "UNKNOWN"
  readonly sourceMutation: "NONE"
}

export interface PostInstallReentryReceipt extends PostInstallReentryReceiptBody {
  readonly receiptHash: string
}

export interface PostInstallReentrySnapshot {
  readonly sessionId: string
  readonly targetRuntimeId: string
  readonly rootInstallReceipt: RestartInstallReceipt
  readonly openingFingerprint: string
  readonly latestFingerprint: string
  readonly latestReceiptHash: string
  readonly continuationReceipts: readonly PostInstallReentryReceipt[]
}

export interface PostInstallReentryResult {
  readonly code: PostInstallReentryCode
  readonly effect: "NONE" | "ENGINE_LOCAL"
  readonly target?: RestartInstallTargetSnapshot
  readonly session?: PostInstallReentrySnapshot
  readonly sessionHandle?: SyntheticPostInstallReentrySession
  readonly receipt?: PostInstallReentryReceipt
  readonly detail?: string
}

interface SessionRecord {
  readonly sessionId: string
  readonly target: SyntheticRestartInstallTarget
  readonly targetRuntimeId: string
  readonly rootInstallReceipt: RestartInstallReceipt
  readonly openingFingerprint: string
  latestFingerprint: string
  latestReceiptHash: string
  readonly continuationReceipts: PostInstallReentryReceipt[]
  readonly commandReceipts: Map<string, PostInstallReentryReceipt>
}

const SESSION_RECORDS = new WeakMap<object, SessionRecord>()

const FORBIDDEN_REPLAY_KEYS = new Set([
  "historicalcommands",
  "replayhistory",
  "replayinstalledhistory",
  "reconstructhistory",
])
const FORBIDDEN_AUTO_KEYS = new Set([
  "autoprocess",
  "autoresume",
  "autorun",
])
const FORBIDDEN_STORE_KEYS = new Set([
  "append",
  "delete",
  "cleanup",
  "repair",
  "storemutation",
])
const FORBIDDEN_SOURCE_KEYS = new Set(["sourcemutation"])
const FORBIDDEN_BACKEND_KEYS = new Set([
  "network",
  "database",
  "cloud",
  "objectstore",
  "sharedbackend",
  "productionbackend",
])

function cloneFrozen<T>(value: T): T {
  const cloned = structuredClone(value)
  function freezeDeep(current: unknown): void {
    if (current !== null && typeof current === "object" && !Object.isFrozen(current)) {
      Object.freeze(current)
      for (const child of Object.values(current as Record<string, unknown>)) freezeDeep(child)
    }
  }
  freezeDeep(cloned)
  return cloned
}

function fail(code: PostInstallReentryCode, detail: string): PostInstallReentryResult {
  return { code, effect: "NONE", detail }
}

function normalizedKey(key: string): string {
  return key.toLowerCase().replace(/[^a-z0-9]/g, "")
}

function findForbiddenKey(
  value: unknown,
): { category: "REPLAY" | "AUTO" | "STORE" | "SOURCE" | "BACKEND"; key: string } | undefined {
  if (value === null || typeof value !== "object") return undefined
  if (Array.isArray(value)) {
    for (const child of value) {
      const found = findForbiddenKey(child)
      if (found) return found
    }
    return undefined
  }
  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    const normalized = normalizedKey(key)
    if (FORBIDDEN_REPLAY_KEYS.has(normalized)) return { category: "REPLAY", key }
    if (FORBIDDEN_AUTO_KEYS.has(normalized)) return { category: "AUTO", key }
    if (FORBIDDEN_STORE_KEYS.has(normalized)) return { category: "STORE", key }
    if (FORBIDDEN_SOURCE_KEYS.has(normalized)) return { category: "SOURCE", key }
    if (FORBIDDEN_BACKEND_KEYS.has(normalized)) return { category: "BACKEND", key }
    const nested = findForbiddenKey(child)
    if (nested) return nested
  }
  return undefined
}

function isTestId(value: unknown, prefix: string): value is string {
  return typeof value === "string" && value.startsWith(prefix) && value.length > prefix.length
}

function latestInstallDecisionByOperation(
  receipts: readonly RestartInstallReceipt[],
): Map<string, RestartInstallReceipt> {
  const latest = new Map<string, RestartInstallReceipt>()
  for (const receipt of receipts) latest.set(receipt.operationId, receipt)
  return latest
}

function unresolvedInstallUnknown(
  snapshot: RestartInstallTargetSnapshot,
): RestartInstallReceipt | undefined {
  for (const receipt of latestInstallDecisionByOperation(snapshot.installReceipts).values()) {
    if (receipt.decision === "UNKNOWN") return receipt
  }
  return undefined
}

function latestCommittedInstallRoot(
  snapshot: RestartInstallTargetSnapshot,
): RestartInstallReceipt | undefined {
  for (let index = snapshot.installReceipts.length - 1; index >= 0; index -= 1) {
    const receipt = snapshot.installReceipts[index]
    if (receipt.decision === "COMMITTED") return receipt
  }
  return undefined
}

function validateInstallRoot(
  snapshot: RestartInstallTargetSnapshot,
): PostInstallReentryResult | RestartInstallReceipt {
  const unknown = unresolvedInstallUnknown(snapshot)
  if (unknown) {
    return fail(
      "REENTRY-HOLD-INSTALL-UNKNOWN",
      "Install target has unresolved UNKNOWN installation outcome",
    )
  }
  const root = latestCommittedInstallRoot(snapshot)
  if (!root || !root.installedAfterFingerprint) {
    return fail("REENTRY-HOLD-INSTALL-ROOT", "No committed installation root is available")
  }
  if (root.targetRuntimeId !== snapshot.targetRuntimeId ||
      root.installedAfterFingerprint !== snapshot.currentStateFingerprint) {
    return fail(
      "REENTRY-CONFLICT-ANCESTRY",
      "Committed installation root does not match target current state",
    )
  }
  return root
}

function rootMarker(root: RestartInstallReceipt): string {
  return createHash("sha256")
    .update(recoveryCanonicalJson({
      kind: "INSTALL_ROOT",
      operationId: root.operationId,
      operationBodyHash: root.operationBodyHash,
      candidatePacketHash: root.candidatePacketHash,
      installedAfterFingerprint: root.installedAfterFingerprint,
    }))
    .digest("hex")
}

function commandBodyHash(
  command: RestartReentryOrdinaryCommand,
  beforeFingerprint: string,
): string {
  return createHash("sha256")
    .update(recoveryCanonicalJson({ command, beforeFingerprint }))
    .digest("hex")
}

export function postInstallReentryReceiptHash(
  body: PostInstallReentryReceiptBody,
): string {
  return createHash("sha256")
    .update(recoveryCanonicalJson(body))
    .digest("hex")
}

function sessionSnapshot(record: SessionRecord): PostInstallReentrySnapshot {
  return cloneFrozen({
    sessionId: record.sessionId,
    targetRuntimeId: record.targetRuntimeId,
    rootInstallReceipt: record.rootInstallReceipt,
    openingFingerprint: record.openingFingerprint,
    latestFingerprint: record.latestFingerprint,
    latestReceiptHash: record.latestReceiptHash,
    continuationReceipts: record.continuationReceipts,
  })
}

export class SyntheticPostInstallReentrySession {
  private constructor() {}

  static open(
    target: SyntheticRestartInstallTarget,
    rawInput: PostInstallReentryOpenInput,
  ): PostInstallReentryResult {
    if (!rawInput || rawInput.schemaVersion !== undefined &&
        rawInput.schemaVersion !== POSTINSTALL_REENTRY_SCHEMA_VERSION) {
      return fail("REENTRY-HOLD-UNSUPPORTED-SCHEMA", "Unsupported re-entry schema")
    }
    if (!isTestId(rawInput.sessionId, "TEST-REENTRY-SESSION-")) {
      return fail("REENTRY-REFUSE-LIVE-ID", "sessionId must use TEST-REENTRY-SESSION-* identity")
    }
    if (typeof rawInput.openedAt !== "string" || rawInput.openedAt.length === 0) {
      return fail("REENTRY-CONFLICT-DETERMINISM", "openedAt must be caller-supplied fixed text or UNKNOWN")
    }

    if (!isPromotedSyntheticRestartInstallTarget(target)) {
      return fail("REENTRY-INVALID-TARGET", "Target is not a promoted synthetic install target")
    }

    let targetSnapshot: RestartInstallTargetSnapshot
    try {
      targetSnapshot = target.snapshot()
    } catch {
      return fail("REENTRY-INVALID-TARGET", "Target is not a promoted synthetic install target")
    }
    if (!isTestId(targetSnapshot.targetRuntimeId, "TEST-RUNTIME-")) {
      return fail("REENTRY-REFUSE-LIVE-ID", "Target identity must use TEST-RUNTIME-*")
    }
    if (restartInstallStateFingerprint(targetSnapshot.currentState) !==
        targetSnapshot.currentStateFingerprint) {
      return fail("REENTRY-INVALID-TARGET", "Target state fingerprint is invalid")
    }

    const root = validateInstallRoot(targetSnapshot)
    if ("code" in root) return root

    const session = new SyntheticPostInstallReentrySession()
    const marker = rootMarker(root)
    SESSION_RECORDS.set(session, {
      sessionId: rawInput.sessionId,
      target,
      targetRuntimeId: targetSnapshot.targetRuntimeId,
      rootInstallReceipt: root,
      openingFingerprint: targetSnapshot.currentStateFingerprint,
      latestFingerprint: targetSnapshot.currentStateFingerprint,
      latestReceiptHash: marker,
      continuationReceipts: [],
      commandReceipts: new Map(),
    })

    return {
      code: "REENTRY-OK-APPLIED",
      effect: "NONE",
      target: targetSnapshot,
      session: sessionSnapshot(SESSION_RECORDS.get(session)!),
      sessionHandle: session,
      detail: "Re-entry session opened without executing any ordinary command",
    }
  }

  snapshot(): PostInstallReentrySnapshot {
    const record = SESSION_RECORDS.get(this)
    if (!record) throw new Error("Invalid re-entry session")
    return sessionSnapshot(record)
  }
}

function parseCommandInput(
  raw: PostInstallReentryCommandInput,
): PostInstallReentryResult | PostInstallReentryCommandInput {
  if (!raw || raw.schemaVersion !== undefined &&
      raw.schemaVersion !== POSTINSTALL_REENTRY_SCHEMA_VERSION) {
    return fail("REENTRY-HOLD-UNSUPPORTED-SCHEMA", "Unsupported re-entry schema")
  }
  if (!isTestId(raw.commandId, "TEST-REENTRY-CMD-")) {
    return fail("REENTRY-REFUSE-LIVE-ID", "commandId must use TEST-REENTRY-CMD-* identity")
  }
  if (!raw.expectedCurrentStateFingerprint) {
    return fail("REENTRY-HOLD-CURRENT-STATE-REQUIRED", "expectedCurrentStateFingerprint is required")
  }
  if (!/^[0-9a-f]{64}$/.test(raw.expectedCurrentStateFingerprint)) {
    return fail("REENTRY-CONFLICT-CURRENT-STATE", "expectedCurrentStateFingerprint must be SHA-256")
  }
  if (typeof raw.recordedAt !== "string" || raw.recordedAt.length === 0) {
    return fail("REENTRY-CONFLICT-DETERMINISM", "recordedAt must be caller-supplied fixed text or UNKNOWN")
  }
  if (!raw.command || typeof raw.command !== "object" || !("type" in raw.command)) {
    return fail("REENTRY-INVALID-COMMAND", "Explicit ordinary command is required")
  }
  const allowed = new Set([
    "EMIT_HANDOFF",
    "OBSERVE",
    "VALIDATE",
    "ADMIT",
    "RECONCILE",
    "BIND_SEED",
    "EVALUATE_ROUTE",
    "COMMIT_ROUTE",
    "REFUSE_SOURCE_MUTATION",
  ])
  if (!allowed.has(raw.command.type)) {
    return fail("REENTRY-REFUSE-COMMAND", "Command is outside qualified re-entry dispatch set")
  }

  const forbidden = findForbiddenKey(raw)
  if (forbidden) {
    switch (forbidden.category) {
      case "REPLAY":
        return fail("REENTRY-REFUSE-HISTORICAL-REPLAY", `Historical replay field present: ${forbidden.key}`)
      case "AUTO":
      case "BACKEND":
        return fail("REENTRY-REFUSE-AUTO-PROCESS", `Automatic/shared backend field present: ${forbidden.key}`)
      case "STORE":
        return fail("REENTRY-REFUSE-STORE-MUTATION", `Store mutation field present: ${forbidden.key}`)
      case "SOURCE":
        return fail("REENTRY-REFUSE-SOURCE-MUTATION", `Source mutation field present: ${forbidden.key}`)
    }
  }

  return raw
}

export function dispatchPostInstallReentryCommand(
  session: SyntheticPostInstallReentrySession,
  rawInput: PostInstallReentryCommandInput,
): PostInstallReentryResult {
  const record = SESSION_RECORDS.get(session)
  if (!record) return fail("REENTRY-INVALID-TARGET", "Unknown re-entry session")

  const parsed = parseCommandInput(rawInput)
  if ("code" in parsed) return parsed

  let targetSnapshot: RestartInstallTargetSnapshot
  try {
    targetSnapshot = record.target.snapshot()
  } catch {
    return fail("REENTRY-INVALID-TARGET", "Bound target is no longer valid")
  }

  const unknown = unresolvedInstallUnknown(targetSnapshot)
  if (unknown) {
    return fail("REENTRY-HOLD-INSTALL-UNKNOWN", "Install target uncertainty reopened")
  }

  if (targetSnapshot.targetRuntimeId !== record.targetRuntimeId) {
    return fail("REENTRY-CONFLICT-ANCESTRY", "Session target identity changed")
  }
  if (restartInstallStateFingerprint(targetSnapshot.currentState) !==
      targetSnapshot.currentStateFingerprint) {
    return fail("REENTRY-INVALID-TARGET", "Target state fingerprint is invalid")
  }
  if (targetSnapshot.currentStateFingerprint !== record.latestFingerprint) {
    return fail("REENTRY-CONFLICT-SESSION-STALE", "Target changed outside this re-entry session")
  }
  if (parsed.expectedCurrentStateFingerprint !== targetSnapshot.currentStateFingerprint) {
    return fail("REENTRY-CONFLICT-CURRENT-STATE", "Caller expected fingerprint is stale")
  }

  const bodyHash = commandBodyHash(parsed.command, parsed.expectedCurrentStateFingerprint)
  const prior = record.commandReceipts.get(parsed.commandId)
  if (prior) {
    if (prior.commandBodyHash !== bodyHash ||
        prior.beforeFingerprint !== parsed.expectedCurrentStateFingerprint) {
      return fail("REENTRY-CONFLICT-COMMAND", "commandId was reused with a different semantic body")
    }
    return {
      code: "REENTRY-OK-ALREADY-APPLIED",
      effect: "NONE",
      target: targetSnapshot,
      session: sessionSnapshot(record),
      receipt: prior,
    }
  }

  const dispatched = __dispatchSyntheticRestartTargetCommandForReentry(
    record.target,
    parsed.expectedCurrentStateFingerprint,
    parsed.command,
  )
  if (!dispatched) {
    return fail("REENTRY-CONFLICT-SESSION-STALE", "Target rejected re-entry dispatch")
  }

  const afterFingerprint = restartInstallStateFingerprint(dispatched.operation.state)
  if (afterFingerprint !== dispatched.target.currentStateFingerprint) {
    return fail("REENTRY-CONFLICT-DETERMINISM", "Applied state fingerprint drifted")
  }

  const body: PostInstallReentryReceiptBody = {
    schemaVersion: POSTINSTALL_REENTRY_SCHEMA_VERSION,
    sessionId: record.sessionId,
    commandId: parsed.commandId,
    commandType: parsed.command.type,
    commandBodyHash: bodyHash,
    targetRuntimeId: record.targetRuntimeId,
    rootInstallOperationId: record.rootInstallReceipt.operationId,
    rootInstallOperationBodyHash: record.rootInstallReceipt.operationBodyHash,
    candidatePacketHash: record.rootInstallReceipt.candidatePacketHash,
    restartSessionId: record.rootInstallReceipt.restartSessionId,
    envelopeId: record.rootInstallReceipt.envelopeId,
    sourceCheckpoint: cloneFrozen(record.rootInstallReceipt.sourceCheckpoint),
    parentReceiptHash: record.latestReceiptHash,
    beforeFingerprint: parsed.expectedCurrentStateFingerprint,
    machineCode: dispatched.operation.code,
    engineEffect: dispatched.operation.engineEffect,
    afterFingerprint,
    recordedAt: parsed.recordedAt,
    sourceMutation: "NONE",
  }
  const receipt = cloneFrozen({
    ...body,
    receiptHash: postInstallReentryReceiptHash(body),
  })

  record.continuationReceipts.push(receipt)
  record.commandReceipts.set(parsed.commandId, receipt)
  record.latestFingerprint = afterFingerprint
  record.latestReceiptHash = receipt.receiptHash

  return {
    code: "REENTRY-OK-APPLIED",
    effect: dispatched.operation.engineEffect,
    target: dispatched.target,
    session: sessionSnapshot(record),
    receipt,
  }
}
