import { createHash } from "node:crypto"
import {
  admit,
  bindSeed,
  commitRoute,
  createInterfaceState,
  emitHandoff,
  evaluateRoute,
  observe,
  reconcile,
  refuseSourceMutation,
  validate,
  type AdmissionContext,
  type InterfaceRuntimeState,
  type OperationResult,
  type PositionIXSource,
} from "./posix-secret-engine-interface.js"
import { recoveryCanonicalJson } from "./posix-secret-engine-recovery-envelope.js"
import {
  PERSISTED_RESTART_PACKET_CANONICAL_VERSION,
  PERSISTED_RESTART_SCHEMA_VERSION,
  isPromotedRestartCandidatePacket,
  persistedRestartPacketHash,
  type RestartCandidatePacket,
  type RestartCandidatePacketBody,
} from "./posix-secret-engine-persisted-restart-reload.js"

export const RESTART_INSTALL_SCHEMA_VERSION = "POSIX-SE-RESTART-INSTALL-1.0" as const

export type RestartInstallAuthorityStatus = "VALID" | "INVALID" | "UNKNOWN"
export type RestartInstallCommitOutcome = "COMMIT" | "NOT_COMMIT" | "UNKNOWN"
export type RestartInstallDecision = "COMMITTED" | "NOT_COMMITTED" | "UNKNOWN"

export type RestartInstallCode =
  | "INSTALL-OK-INSTALLED"
  | "INSTALL-OK-ALREADY-INSTALLED"
  | "INSTALL-OK-RECONCILED-NOT-COMMITTED"
  | "INSTALL-HOLD-CURRENT-STATE-REQUIRED"
  | "INSTALL-HOLD-AUTHORITY-UNKNOWN"
  | "INSTALL-HOLD-OPERATION-UNKNOWN"
  | "INSTALL-HOLD-UNSUPPORTED-SCHEMA"
  | "INSTALL-HOLD-BASELINE"
  | "INSTALL-DENY-NO-AUTHORITY"
  | "INSTALL-DENY-AUTHORITY-INVALID"
  | "INSTALL-DENY-NOT-COMMITTED"
  | "INSTALL-CONFLICT-CURRENT-STATE"
  | "INSTALL-CONFLICT-OPERATION"
  | "INSTALL-CONFLICT-ANCESTRY"
  | "INSTALL-CONFLICT-DETERMINISM"
  | "INSTALL-INVALID-CANDIDATE"
  | "INSTALL-INVALID-TARGET"
  | "INSTALL-INVALID-RECEIPT"
  | "INSTALL-REFUSE-LIVE-ID"
  | "INSTALL-REFUSE-NONFRESH-TARGET"
  | "INSTALL-REFUSE-AUTO-INSTALL"
  | "INSTALL-REFUSE-COMMAND-REPLAY"
  | "INSTALL-REFUSE-STORE-MUTATION"
  | "INSTALL-REFUSE-SOURCE-MUTATION"

export interface RestartInstallInput {
  readonly schemaVersion?: typeof RESTART_INSTALL_SCHEMA_VERSION
  readonly operationId: string
  readonly authorityRef: string
  readonly authorityStatus: RestartInstallAuthorityStatus
  readonly candidate: RestartCandidatePacket
  readonly expectedCurrentStateFingerprint: string
  readonly allowedRuntimeArtifactRefs: readonly string[]
  readonly commitOutcome: RestartInstallCommitOutcome
  readonly recordedAt: string | "UNKNOWN"
}

export interface RestartInstallReceipt {
  readonly schemaVersion: typeof RESTART_INSTALL_SCHEMA_VERSION
  readonly operationId: string
  readonly operationBodyHash: string
  readonly targetRuntimeId: string
  readonly authorityRef: string
  readonly candidatePacketHash: string
  readonly candidateStateFingerprint: string
  readonly restartSessionId: string
  readonly envelopeId: string
  readonly sourceCheckpoint: {
    readonly sequence: number
    readonly envelopeHash: string
  }
  readonly expectedBeforeFingerprint: string
  readonly decision: RestartInstallDecision
  readonly installedAfterFingerprint?: string
  readonly recordedAt: string | "UNKNOWN"
  readonly ancestry: readonly string[]
}

export interface RestartInstallTargetSnapshot {
  readonly targetRuntimeId: string
  readonly currentState: InterfaceRuntimeState
  readonly currentStateFingerprint: string
  readonly installReceipts: readonly RestartInstallReceipt[]
}

export interface RestartInstallResult {
  readonly code: RestartInstallCode
  readonly effect: "NONE" | "ENGINE_LOCAL"
  readonly target?: RestartInstallTargetSnapshot
  readonly receipt?: RestartInstallReceipt
  readonly detail?: string
}

export interface RestartInstallReconcileInput {
  readonly operationId: string
  readonly authoritativeDecision: RestartInstallDecision
  readonly recordedAt: string | "UNKNOWN"
}

interface TargetRecord {
  readonly targetRuntimeId: string
  currentState: InterfaceRuntimeState
  currentStateFingerprint: string
  readonly installReceipts: RestartInstallReceipt[]
  readonly pendingCandidates: Map<string, InterfaceRuntimeState>
}

interface ParsedInstallInput {
  readonly schemaVersion: typeof RESTART_INSTALL_SCHEMA_VERSION
  readonly operationId: string
  readonly authorityRef: string
  readonly authorityStatus: RestartInstallAuthorityStatus
  readonly candidate: RestartCandidatePacket
  readonly expectedCurrentStateFingerprint: string
  readonly allowedRuntimeArtifactRefs: readonly string[]
  readonly commitOutcome: RestartInstallCommitOutcome
  readonly recordedAt: string | "UNKNOWN"
}

const TARGET_RECORDS = new WeakMap<object, TargetRecord>()

const REQUIRED_CANDIDATE_BOUNDARIES = [
  "NON_PRODUCTION_ONLY",
  "NO_RUNTIME_INSTALL",
  "SOURCE_MUTATION_NONE",
  "CHECKPOINT_REQUIRED",
] as const

const FORBIDDEN_AUTO_INSTALL_KEYS = new Set([
  "autoinstall",
  "loadandinstall",
  "installautomatically",
])
const FORBIDDEN_COMMAND_REPLAY_KEYS = new Set([
  "admit",
  "reconcileadmission",
  "bindseed",
  "evaluateroute",
  "commitroute",
  "routecommand",
  "autoroute",
  "return",
])
const FORBIDDEN_STORE_MUTATION_KEYS = new Set([
  "append",
  "delete",
  "cleanup",
  "repair",
  "storemutation",
])
const FORBIDDEN_SOURCE_MUTATION_KEYS = new Set([
  "sourcemutation",
])
const FORBIDDEN_BACKEND_KEYS = new Set([
  "network",
  "database",
  "cloud",
  "objectstore",
  "sharedbackend",
  "productionbackend",
])

function deepFreeze<T>(value: T): T {
  if (value !== null && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value)
    for (const child of Object.values(value as Record<string, unknown>)) deepFreeze(child)
  }
  return value
}

function cloneFrozen<T>(value: T): T {
  return deepFreeze(structuredClone(value))
}

function normalizedKey(key: string): string {
  return key.toLowerCase().replace(/[^a-z0-9]/g, "")
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value)
}

function findForbiddenInputKey(
  value: unknown,
  skipCandidate = false,
): { readonly category: "AUTO" | "COMMAND" | "STORE" | "SOURCE" | "BACKEND"; readonly key: string } | undefined {
  if (value === null || typeof value !== "object") return undefined
  if (Array.isArray(value)) {
    for (const child of value) {
      const found = findForbiddenInputKey(child)
      if (found) return found
    }
    return undefined
  }

  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    if (skipCandidate && key === "candidate") continue
    const normalized = normalizedKey(key)
    if (FORBIDDEN_AUTO_INSTALL_KEYS.has(normalized)) return { category: "AUTO", key }
    if (FORBIDDEN_COMMAND_REPLAY_KEYS.has(normalized)) return { category: "COMMAND", key }
    if (FORBIDDEN_STORE_MUTATION_KEYS.has(normalized)) return { category: "STORE", key }
    if (FORBIDDEN_SOURCE_MUTATION_KEYS.has(normalized)) return { category: "SOURCE", key }
    if (FORBIDDEN_BACKEND_KEYS.has(normalized)) return { category: "BACKEND", key }
    const nested = findForbiddenInputKey(child)
    if (nested) return nested
  }
  return undefined
}

function fail(code: RestartInstallCode, detail: string): RestartInstallResult {
  return { code, effect: "NONE", detail }
}

function isSyntheticId(value: unknown, prefix: string): value is string {
  return typeof value === "string" && value.startsWith(prefix) && value.length > prefix.length
}

function isSha256(value: unknown): value is string {
  return typeof value === "string" && /^[0-9a-f]{64}$/.test(value)
}

export function restartInstallStateFingerprint(state: InterfaceRuntimeState): string {
  return createHash("sha256")
    .update(recoveryCanonicalJson(state))
    .digest("hex")
}

function operationBodyHash(input: {
  readonly targetRuntimeId: string
  readonly candidatePacketHash: string
  readonly expectedCurrentStateFingerprint: string
  readonly authorityRef: string
}): string {
  return createHash("sha256")
    .update(recoveryCanonicalJson(input))
    .digest("hex")
}

function targetSnapshot(record: TargetRecord): RestartInstallTargetSnapshot {
  return cloneFrozen({
    targetRuntimeId: record.targetRuntimeId,
    currentState: record.currentState,
    currentStateFingerprint: record.currentStateFingerprint,
    installReceipts: record.installReceipts,
  })
}

export class SyntheticRestartInstallTarget {
  constructor(
    targetRuntimeId: string,
    initialState: InterfaceRuntimeState = createInterfaceState(),
  ) {
    const cloned = structuredClone(initialState)
    TARGET_RECORDS.set(this, {
      targetRuntimeId,
      currentState: cloned,
      currentStateFingerprint: restartInstallStateFingerprint(cloned),
      installReceipts: [],
      pendingCandidates: new Map(),
    })
  }

  snapshot(): RestartInstallTargetSnapshot {
    const record = TARGET_RECORDS.get(this)
    if (!record) throw new Error("Invalid restart install target")
    return targetSnapshot(record)
  }
}

export function isPromotedSyntheticRestartInstallTarget(
  value: unknown,
): value is SyntheticRestartInstallTarget {
  return typeof value === "object" &&
    value !== null &&
    TARGET_RECORDS.has(value as object)
}

function getTargetRecord(target: SyntheticRestartInstallTarget): TargetRecord | undefined {
  return TARGET_RECORDS.get(target)
}

function validateTargetRecord(record: TargetRecord): RestartInstallResult | undefined {
  if (!isSyntheticId(record.targetRuntimeId, "TEST-RUNTIME-")) {
    return fail("INSTALL-REFUSE-LIVE-ID", "Installation target must use TEST-RUNTIME-* identity")
  }

  const recomputed = restartInstallStateFingerprint(record.currentState)
  if (recomputed !== record.currentStateFingerprint) {
    return fail("INSTALL-INVALID-TARGET", "Target currentStateFingerprint does not match currentState")
  }

  for (const receipt of record.installReceipts) {
    if (!Object.isFrozen(receipt) ||
        receipt.targetRuntimeId !== record.targetRuntimeId ||
        !isSyntheticId(receipt.operationId, "TEST-INSTALL-OP-") ||
        !isSha256(receipt.operationBodyHash)) {
      return fail("INSTALL-INVALID-RECEIPT", "Target contains an invalid install receipt")
    }
  }

  return undefined
}

function parseInstallInput(raw: unknown): RestartInstallResult | ParsedInstallInput {
  if (!isPlainRecord(raw)) {
    return fail("INSTALL-INVALID-CANDIDATE", "Installation input must be a plain object")
  }

  const forbidden = findForbiddenInputKey(raw, true)
  if (forbidden) {
    if (forbidden.category === "AUTO") {
      return fail("INSTALL-REFUSE-AUTO-INSTALL", `Forbidden auto-install field present: ${forbidden.key}`)
    }
    if (forbidden.category === "COMMAND") {
      return fail("INSTALL-REFUSE-COMMAND-REPLAY", `Forbidden command-replay field present: ${forbidden.key}`)
    }
    if (forbidden.category === "STORE") {
      return fail("INSTALL-REFUSE-STORE-MUTATION", `Forbidden store-mutation field present: ${forbidden.key}`)
    }
    if (forbidden.category === "SOURCE") {
      return fail("INSTALL-REFUSE-SOURCE-MUTATION", `Forbidden source-mutation field present: ${forbidden.key}`)
    }
    return fail("INSTALL-REFUSE-AUTO-INSTALL", `Shared/live backend field is out of scope: ${forbidden.key}`)
  }

  const schemaVersion = raw.schemaVersion ?? RESTART_INSTALL_SCHEMA_VERSION
  if (schemaVersion !== RESTART_INSTALL_SCHEMA_VERSION) {
    return fail("INSTALL-HOLD-UNSUPPORTED-SCHEMA", "Unsupported restart-install schema")
  }

  if (!isSyntheticId(raw.operationId, "TEST-INSTALL-OP-")) {
    return fail("INSTALL-REFUSE-LIVE-ID", "operationId must use TEST-INSTALL-OP-* identity")
  }

  if (raw.authorityRef === undefined || raw.authorityRef === null || raw.authorityRef === "") {
    return fail("INSTALL-DENY-NO-AUTHORITY", "Explicit install authority is required")
  }
  if (!isSyntheticId(raw.authorityRef, "TEST-INSTALL-AUTH-")) {
    return fail("INSTALL-REFUSE-LIVE-ID", "authorityRef must use TEST-INSTALL-AUTH-* identity")
  }

  if (!["VALID", "INVALID", "UNKNOWN"].includes(String(raw.authorityStatus))) {
    return fail("INSTALL-DENY-AUTHORITY-INVALID", "authorityStatus is invalid")
  }
  if (raw.authorityStatus === "UNKNOWN") {
    return fail("INSTALL-HOLD-AUTHORITY-UNKNOWN", "Install authority is unresolved")
  }
  if (raw.authorityStatus === "INVALID") {
    return fail("INSTALL-DENY-AUTHORITY-INVALID", "Install authority is invalid")
  }

  if (!("expectedCurrentStateFingerprint" in raw) ||
      raw.expectedCurrentStateFingerprint === undefined ||
      raw.expectedCurrentStateFingerprint === null ||
      raw.expectedCurrentStateFingerprint === "") {
    return fail("INSTALL-HOLD-CURRENT-STATE-REQUIRED", "expectedCurrentStateFingerprint is required")
  }
  if (!isSha256(raw.expectedCurrentStateFingerprint)) {
    return fail("INSTALL-CONFLICT-CURRENT-STATE", "expectedCurrentStateFingerprint must be a SHA-256 digest")
  }

  if (!Array.isArray(raw.allowedRuntimeArtifactRefs) ||
      raw.allowedRuntimeArtifactRefs.length === 0 ||
      raw.allowedRuntimeArtifactRefs.some(value => typeof value !== "string" || value.length === 0)) {
    return fail("INSTALL-HOLD-BASELINE", "Explicit allowedRuntimeArtifactRefs policy is required")
  }

  if (!["COMMIT", "NOT_COMMIT", "UNKNOWN"].includes(String(raw.commitOutcome))) {
    return fail("INSTALL-CONFLICT-DETERMINISM", "commitOutcome must be explicit and deterministic")
  }

  if (typeof raw.recordedAt !== "string" || raw.recordedAt.length === 0) {
    return fail("INSTALL-CONFLICT-DETERMINISM", "recordedAt must be caller-supplied fixed text or UNKNOWN")
  }

  if (!isPlainRecord(raw.candidate)) {
    return fail("INSTALL-INVALID-CANDIDATE", "Restart candidate is missing or malformed")
  }

  return {
    schemaVersion: RESTART_INSTALL_SCHEMA_VERSION,
    operationId: raw.operationId,
    authorityRef: raw.authorityRef,
    authorityStatus: raw.authorityStatus as RestartInstallAuthorityStatus,
    candidate: raw.candidate as unknown as RestartCandidatePacket,
    expectedCurrentStateFingerprint: raw.expectedCurrentStateFingerprint,
    allowedRuntimeArtifactRefs: [...raw.allowedRuntimeArtifactRefs] as string[],
    commitOutcome: raw.commitOutcome as RestartInstallCommitOutcome,
    recordedAt: raw.recordedAt,
  }
}

function validateCandidate(
  candidate: RestartCandidatePacket,
  allowedRuntimeArtifactRefs: readonly string[],
): RestartInstallResult | undefined {
  if (!isPromotedRestartCandidatePacket(candidate)) {
    return fail("INSTALL-INVALID-CANDIDATE", "Candidate lacks promoted restart provenance")
  }
  if (candidate.schemaVersion !== PERSISTED_RESTART_SCHEMA_VERSION ||
      candidate.canonicalVersion !== PERSISTED_RESTART_PACKET_CANONICAL_VERSION ||
      !candidate.restartSessionId.startsWith("TEST-RESTART-") ||
      !candidate.envelopeId.startsWith("TEST-RECOVERY-") ||
      !isSha256(candidate.packetHash) ||
      !isSha256(candidate.sourceCheckpoint.envelopeHash)) {
    return fail("INSTALL-INVALID-CANDIDATE", "Candidate schema, identity, or hash fields are invalid")
  }
  if (!REQUIRED_CANDIDATE_BOUNDARIES.every(boundary => candidate.boundaries.includes(boundary))) {
    return fail("INSTALL-INVALID-CANDIDATE", "Candidate is missing required restart boundaries")
  }
  if (!Object.isFrozen(candidate) ||
      !Object.isFrozen(candidate.stateSnapshot) ||
      !Object.isFrozen(candidate.runtimeSignature)) {
    return fail("INSTALL-INVALID-CANDIDATE", "Candidate must remain deeply immutable")
  }

  const { packetHash, ...body } = candidate
  if (persistedRestartPacketHash(body as RestartCandidatePacketBody) !== packetHash) {
    return fail("INSTALL-INVALID-CANDIDATE", "Candidate packet hash does not match canonical packet body")
  }
  if (!allowedRuntimeArtifactRefs.includes(candidate.runtimeArtifactRef)) {
    return fail("INSTALL-HOLD-BASELINE", "Candidate runtimeArtifactRef is outside explicit install policy")
  }
  return undefined
}

function latestReceipt(record: TargetRecord, operationId: string): RestartInstallReceipt | undefined {
  for (let index = record.installReceipts.length - 1; index >= 0; index -= 1) {
    if (record.installReceipts[index].operationId === operationId) return record.installReceipts[index]
  }
  return undefined
}

function hasCommittedInstall(record: TargetRecord): boolean {
  return record.installReceipts.some(receipt => receipt.decision === "COMMITTED")
}

function latestUnresolvedUnknownReceipt(
  record: TargetRecord,
): RestartInstallReceipt | undefined {
  const seenOperationIds = new Set<string>()
  for (let index = record.installReceipts.length - 1; index >= 0; index -= 1) {
    const receipt = record.installReceipts[index]
    if (seenOperationIds.has(receipt.operationId)) continue
    seenOperationIds.add(receipt.operationId)
    if (receipt.decision === "UNKNOWN") return receipt
  }
  return undefined
}

function makeReceipt(
  record: TargetRecord,
  input: ParsedInstallInput,
  bodyHash: string,
  candidateStateFingerprint: string,
  decision: RestartInstallDecision,
  installedAfterFingerprint?: string,
  recordedAt = input.recordedAt,
): RestartInstallReceipt {
  return cloneFrozen({
    schemaVersion: RESTART_INSTALL_SCHEMA_VERSION,
    operationId: input.operationId,
    operationBodyHash: bodyHash,
    targetRuntimeId: record.targetRuntimeId,
    authorityRef: input.authorityRef,
    candidatePacketHash: input.candidate.packetHash,
    candidateStateFingerprint,
    restartSessionId: input.candidate.restartSessionId,
    envelopeId: input.candidate.envelopeId,
    sourceCheckpoint: input.candidate.sourceCheckpoint,
    expectedBeforeFingerprint: input.expectedCurrentStateFingerprint,
    decision,
    installedAfterFingerprint,
    recordedAt,
    ancestry: [
      ...input.candidate.ancestry,
      `installTarget:${record.targetRuntimeId}`,
      `installOperation:${input.operationId}`,
      `candidatePacket:${input.candidate.packetHash}`,
    ],
  })
}

function resultWithTarget(
  code: RestartInstallCode,
  effect: "NONE" | "ENGINE_LOCAL",
  record: TargetRecord,
  receipt?: RestartInstallReceipt,
  detail?: string,
): RestartInstallResult {
  return {
    code,
    effect,
    target: targetSnapshot(record),
    receipt,
    detail,
  }
}

export function installRestartCandidate(
  target: SyntheticRestartInstallTarget,
  rawInput: unknown,
): RestartInstallResult {
  const record = getTargetRecord(target)
  if (!record) return fail("INSTALL-INVALID-TARGET", "Target is not a synthetic restart install wrapper")

  const targetFailure = validateTargetRecord(record)
  if (targetFailure) return targetFailure

  const parsed = parseInstallInput(rawInput)
  if ("code" in parsed) return parsed

  const candidateFailure = validateCandidate(parsed.candidate, parsed.allowedRuntimeArtifactRefs)
  if (candidateFailure) return candidateFailure

  const candidateStateFingerprint = restartInstallStateFingerprint(parsed.candidate.stateSnapshot)
  const bodyHash = operationBodyHash({
    targetRuntimeId: record.targetRuntimeId,
    candidatePacketHash: parsed.candidate.packetHash,
    expectedCurrentStateFingerprint: parsed.expectedCurrentStateFingerprint,
    authorityRef: parsed.authorityRef,
  })

  const prior = latestReceipt(record, parsed.operationId)
  if (prior) {
    if (prior.operationBodyHash !== bodyHash) {
      return resultWithTarget(
        "INSTALL-CONFLICT-OPERATION",
        "NONE",
        record,
        prior,
        "operationId was reused with a different semantic body",
      )
    }
    if (prior.decision === "COMMITTED") {
      if (record.currentStateFingerprint !== prior.installedAfterFingerprint) {
        return resultWithTarget(
          "INSTALL-CONFLICT-CURRENT-STATE",
          "NONE",
          record,
          prior,
          "Committed install target no longer matches installed receipt fingerprint",
        )
      }
      return resultWithTarget("INSTALL-OK-ALREADY-INSTALLED", "NONE", record, prior)
    }
    if (prior.decision === "UNKNOWN") {
      return resultWithTarget(
        "INSTALL-HOLD-OPERATION-UNKNOWN",
        "NONE",
        record,
        prior,
        "Unknown install outcome must reconcile before retry",
      )
    }
    return resultWithTarget(
      "INSTALL-CONFLICT-OPERATION",
      "NONE",
      record,
      prior,
      "A NOT_COMMITTED operationId is historical and must not be reused",
    )
  }

  const unresolvedUnknown = latestUnresolvedUnknownReceipt(record)
  if (unresolvedUnknown) {
    return resultWithTarget(
      "INSTALL-HOLD-OPERATION-UNKNOWN",
      "NONE",
      record,
      unresolvedUnknown,
      "Target has an unresolved install outcome; explicit reconcile is required before any new install operation",
    )
  }

  const recomputedBefore = restartInstallStateFingerprint(record.currentState)
  if (recomputedBefore !== parsed.expectedCurrentStateFingerprint) {
    return resultWithTarget(
      "INSTALL-CONFLICT-CURRENT-STATE",
      "NONE",
      record,
      undefined,
      "Target current state differs from caller expectedCurrentStateFingerprint",
    )
  }

  if (!hasCommittedInstall(record)) {
    const freshFingerprint = restartInstallStateFingerprint(createInterfaceState())
    if (recomputedBefore !== freshFingerprint) {
      return resultWithTarget(
        "INSTALL-REFUSE-NONFRESH-TARGET",
        "NONE",
        record,
        undefined,
        "First v1 install requires canonical fresh InterfaceRuntimeState",
      )
    }
  }

  if (parsed.commitOutcome === "COMMIT") {
    record.currentState = structuredClone(parsed.candidate.stateSnapshot)
    record.currentStateFingerprint = candidateStateFingerprint
    const receipt = makeReceipt(
      record,
      parsed,
      bodyHash,
      candidateStateFingerprint,
      "COMMITTED",
      candidateStateFingerprint,
    )
    record.installReceipts.push(receipt)
    return resultWithTarget("INSTALL-OK-INSTALLED", "ENGINE_LOCAL", record, receipt)
  }

  if (parsed.commitOutcome === "UNKNOWN") {
    const receipt = makeReceipt(
      record,
      parsed,
      bodyHash,
      candidateStateFingerprint,
      "UNKNOWN",
    )
    record.installReceipts.push(receipt)
    record.pendingCandidates.set(parsed.operationId, structuredClone(parsed.candidate.stateSnapshot))
    return resultWithTarget(
      "INSTALL-HOLD-OPERATION-UNKNOWN",
      "NONE",
      record,
      receipt,
      "Install outcome is unknown; explicit reconcile required",
    )
  }

  const receipt = makeReceipt(
    record,
    parsed,
    bodyHash,
    candidateStateFingerprint,
    "NOT_COMMITTED",
  )
  record.installReceipts.push(receipt)
  return resultWithTarget(
    "INSTALL-DENY-NOT-COMMITTED",
    "NONE",
    record,
    receipt,
    "Synthetic commit reported NOT_COMMITTED",
  )
}

export function reconcileRestartInstall(
  target: SyntheticRestartInstallTarget,
  rawInput: unknown,
): RestartInstallResult {
  const record = getTargetRecord(target)
  if (!record) return fail("INSTALL-INVALID-TARGET", "Target is not a synthetic restart install wrapper")

  const targetFailure = validateTargetRecord(record)
  if (targetFailure) return targetFailure

  if (!isPlainRecord(rawInput) ||
      !isSyntheticId(rawInput.operationId, "TEST-INSTALL-OP-") ||
      !["COMMITTED", "NOT_COMMITTED", "UNKNOWN"].includes(String(rawInput.authoritativeDecision)) ||
      typeof rawInput.recordedAt !== "string" ||
      rawInput.recordedAt.length === 0) {
    return fail("INSTALL-INVALID-RECEIPT", "Reconcile input is malformed")
  }

  const forbidden = findForbiddenInputKey(rawInput)
  if (forbidden) {
    if (forbidden.category === "COMMAND") return fail("INSTALL-REFUSE-COMMAND-REPLAY", "Reconcile cannot replay runtime commands")
    if (forbidden.category === "STORE") return fail("INSTALL-REFUSE-STORE-MUTATION", "Reconcile cannot mutate recovery store")
    if (forbidden.category === "SOURCE") return fail("INSTALL-REFUSE-SOURCE-MUTATION", "Reconcile cannot mutate sources")
    return fail("INSTALL-REFUSE-AUTO-INSTALL", "Reconcile contains forbidden automatic/backend behavior")
  }

  const operationId = rawInput.operationId
  const authoritativeDecision = rawInput.authoritativeDecision as RestartInstallDecision
  const recordedAt = rawInput.recordedAt
  const prior = latestReceipt(record, operationId)

  if (!prior) {
    return resultWithTarget(
      "INSTALL-HOLD-OPERATION-UNKNOWN",
      "NONE",
      record,
      undefined,
      "No install receipt exists for operationId",
    )
  }
  if (prior.decision === "COMMITTED") {
    if (record.currentStateFingerprint !== prior.installedAfterFingerprint) {
      return resultWithTarget(
        "INSTALL-CONFLICT-CURRENT-STATE",
        "NONE",
        record,
        prior,
        "Committed receipt no longer matches target state",
      )
    }
    return resultWithTarget("INSTALL-OK-ALREADY-INSTALLED", "NONE", record, prior)
  }
  if (prior.decision !== "UNKNOWN") {
    return resultWithTarget(
      "INSTALL-CONFLICT-OPERATION",
      "NONE",
      record,
      prior,
      "Only UNKNOWN install outcomes may be reconciled",
    )
  }
  if (authoritativeDecision === "UNKNOWN") {
    return resultWithTarget(
      "INSTALL-HOLD-OPERATION-UNKNOWN",
      "NONE",
      record,
      prior,
      "Authoritative install outcome remains unknown",
    )
  }

  if (authoritativeDecision === "NOT_COMMITTED") {
    const receipt = cloneFrozen({
      ...prior,
      decision: "NOT_COMMITTED" as const,
      installedAfterFingerprint: undefined,
      recordedAt,
      ancestry: [...prior.ancestry, "installReconcile:NOT_COMMITTED"],
    })
    record.installReceipts.push(receipt)
    record.pendingCandidates.delete(operationId)
    return resultWithTarget(
      "INSTALL-OK-RECONCILED-NOT-COMMITTED",
      "NONE",
      record,
      receipt,
    )
  }

  const pending = record.pendingCandidates.get(operationId)
  if (!pending) {
    return resultWithTarget(
      "INSTALL-INVALID-RECEIPT",
      "NONE",
      record,
      prior,
      "UNKNOWN receipt is missing its private pending candidate evidence",
    )
  }

  const candidateFingerprint = restartInstallStateFingerprint(pending)
  if (candidateFingerprint !== prior.candidateStateFingerprint) {
    return resultWithTarget(
      "INSTALL-CONFLICT-ANCESTRY",
      "NONE",
      record,
      prior,
      "Pending candidate state no longer matches receipt ancestry",
    )
  }

  if (record.currentStateFingerprint === candidateFingerprint) {
    const receipt = cloneFrozen({
      ...prior,
      decision: "COMMITTED" as const,
      installedAfterFingerprint: candidateFingerprint,
      recordedAt,
      ancestry: [...prior.ancestry, "installReconcile:COMMITTED_ALREADY_PRESENT"],
    })
    record.installReceipts.push(receipt)
    record.pendingCandidates.delete(operationId)
    return resultWithTarget("INSTALL-OK-ALREADY-INSTALLED", "NONE", record, receipt)
  }

  if (record.currentStateFingerprint !== prior.expectedBeforeFingerprint) {
    return resultWithTarget(
      "INSTALL-CONFLICT-CURRENT-STATE",
      "NONE",
      record,
      prior,
      "Target changed after UNKNOWN install attempt",
    )
  }

  record.currentState = structuredClone(pending)
  record.currentStateFingerprint = candidateFingerprint
  const receipt = cloneFrozen({
    ...prior,
    decision: "COMMITTED" as const,
    installedAfterFingerprint: candidateFingerprint,
    recordedAt,
    ancestry: [...prior.ancestry, "installReconcile:COMMITTED"],
  })
  record.installReceipts.push(receipt)
  record.pendingCandidates.delete(operationId)
  return resultWithTarget("INSTALL-OK-INSTALLED", "ENGINE_LOCAL", record, receipt)
}


export type RestartReentryOrdinaryCommand =
  | {
      readonly type: "EMIT_HANDOFF"
      readonly source: PositionIXSource
      readonly handoffId: string
      readonly observedAt: string
      readonly supersedesId?: string
    }
  | { readonly type: "OBSERVE"; readonly handoffId: string }
  | { readonly type: "VALIDATE"; readonly handoffId: string }
  | { readonly type: "ADMIT"; readonly context: AdmissionContext }
  | {
      readonly type: "RECONCILE"
      readonly operationId: string
      readonly authoritativeDecision: "COMMITTED" | "NOT_COMMITTED" | "UNKNOWN"
    }
  | { readonly type: "BIND_SEED"; readonly seedId: string }
  | { readonly type: "EVALUATE_ROUTE" }
  | { readonly type: "COMMIT_ROUTE"; readonly routeId: string }
  | { readonly type: "REFUSE_SOURCE_MUTATION" }

export interface RestartReentryDispatchResult {
  readonly operation: OperationResult
  readonly target: RestartInstallTargetSnapshot
}

function dispatchOrdinaryInterfaceCommand(
  state: InterfaceRuntimeState,
  command: RestartReentryOrdinaryCommand,
): OperationResult {
  switch (command.type) {
    case "EMIT_HANDOFF":
      return emitHandoff(
        state,
        command.source,
        command.handoffId,
        command.observedAt,
        command.supersedesId,
      )
    case "OBSERVE":
      return observe(state, command.handoffId)
    case "VALIDATE":
      return validate(state, command.handoffId)
    case "ADMIT":
      return admit(state, command.context)
    case "RECONCILE":
      return reconcile(state, command.operationId, command.authoritativeDecision)
    case "BIND_SEED":
      return bindSeed(state, command.seedId)
    case "EVALUATE_ROUTE":
      return evaluateRoute(state)
    case "COMMIT_ROUTE":
      return commitRoute(state, command.routeId)
    case "REFUSE_SOURCE_MUTATION":
      return refuseSourceMutation(state)
  }
}

export function __dispatchSyntheticRestartTargetCommandForReentry(
  target: SyntheticRestartInstallTarget,
  expectedCurrentStateFingerprint: string,
  command: RestartReentryOrdinaryCommand,
): RestartReentryDispatchResult | undefined {
  const record = getTargetRecord(target)
  if (!record) return undefined
  const targetFailure = validateTargetRecord(record)
  if (targetFailure) return undefined
  if (latestUnresolvedUnknownReceipt(record)) return undefined

  const before = restartInstallStateFingerprint(record.currentState)
  if (before !== record.currentStateFingerprint ||
      before !== expectedCurrentStateFingerprint) {
    return undefined
  }

  const operation = dispatchOrdinaryInterfaceCommand(
    structuredClone(record.currentState),
    structuredClone(command),
  )
  record.currentState = structuredClone(operation.state)
  record.currentStateFingerprint = restartInstallStateFingerprint(record.currentState)

  return {
    operation: cloneFrozen(operation),
    target: targetSnapshot(record),
  }
}
