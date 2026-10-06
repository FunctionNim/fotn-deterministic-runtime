import { createHash } from "node:crypto"
import {
  validateAdmissionReceipt,
  type InterfaceRuntimeState,
} from "./posix-secret-engine-interface.js"
import {
  stableJson,
  verifyRuntimeSignature,
  type RuntimeSignature,
  type RuntimeSignatureInput,
} from "../runtime-signature/runtime-signature.js"
import { POSIX_SE_NONPROD_HARNESS_001 } from "./posix-secret-engine-nonprod-harness.js"

export const RECOVERY_SCHEMA_VERSION = "POSIX-SE-RECOVERY-1.0" as const

export type RecoveryCode =
  | "RECOVERY-VALID-CANDIDATE"
  | "RECOVERY-HOLD-UNSUPPORTED-SCHEMA"
  | "RECOVERY-HOLD-BASELINE-MISMATCH"
  | "RECOVERY-INVALID-ENVELOPE-HASH"
  | "RECOVERY-INVALID-SIGNATURE"
  | "RECOVERY-INVALID-RECEIPT"
  | "RECOVERY-CONFLICT-SEQUENCE"
  | "RECOVERY-CONFLICT-PREV-HASH"
  | "RECOVERY-CONFLICT-CHECKPOINT"
  | "RECOVERY-CONFLICT-STATE-EVIDENCE"
  | "RECOVERY-REFUSE-LIVE-ID"
  | "RECOVERY-REFUSE-AUTO-RECOVERY"
  | "RECOVERY-REFUSE-SOURCE-MUTATION"
  | "LOCAL_INTEGRITY_ONLY"

export interface RecoveryEnvelope {
  readonly schemaVersion: typeof RECOVERY_SCHEMA_VERSION
  readonly envelopeId: string
  readonly sequence: number
  readonly previousEnvelopeHash: string | null
  readonly runtimeArtifactRef: string
  readonly harnessId: typeof POSIX_SE_NONPROD_HARNESS_001.harnessId
  readonly scenarioId: string
  readonly stateSnapshot: InterfaceRuntimeState
  readonly signatureInput: RuntimeSignatureInput
  readonly runtimeSignature: RuntimeSignature
  readonly ancestry: readonly string[]
  readonly boundaries: readonly string[]
  readonly recordedAt: string | "UNKNOWN"
  readonly sourceMutation: "NONE"
  readonly envelopeHash: string
}

export interface RecoveryEnvelopeInput extends Omit<RecoveryEnvelope, "schemaVersion" | "envelopeHash"> {
  readonly schemaVersion?: typeof RECOVERY_SCHEMA_VERSION
}

export interface RecoveryCheckpoint {
  readonly sequence: number
  readonly envelopeHash: string
}

export interface RecoveryVerificationPolicy {
  readonly allowedRuntimeArtifactRefs: readonly string[]
}

export interface VerifiedRecoveryCandidate {
  readonly envelopeId: string
  readonly sequence: number
  readonly runtimeArtifactRef: string
  readonly stateSnapshot: InterfaceRuntimeState
  readonly runtimeSignature: RuntimeSignature
  readonly ancestry: readonly string[]
}

export interface RecoveryVerificationResult {
  readonly code: RecoveryCode
  readonly valid: boolean
  readonly completeChainFreshness: boolean
  readonly candidate?: VerifiedRecoveryCandidate
  readonly detail?: string
}

const REQUIRED_BOUNDARIES = [
  "NON_PRODUCTION_ONLY",
  "SOURCE_MUTATION_NONE",
  "NO_AUTO_RECOVERY",
] as const

function deepFreeze<T>(value: T): T {
  if (value !== null && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value)
    for (const child of Object.values(value as Record<string, unknown>)) {
      deepFreeze(child)
    }
  }
  return value
}

function recoveryBody(envelope: Omit<RecoveryEnvelope, "envelopeHash">): unknown {
  return envelope
}

export function recoveryEnvelopeHash(envelope: Omit<RecoveryEnvelope, "envelopeHash">): string {
  return createHash("sha256").update(stableJson(recoveryBody(envelope))).digest("hex")
}

export function createRecoveryEnvelope(input: RecoveryEnvelopeInput): RecoveryEnvelope {
  const body: Omit<RecoveryEnvelope, "envelopeHash"> = {
    schemaVersion: input.schemaVersion ?? RECOVERY_SCHEMA_VERSION,
    envelopeId: input.envelopeId,
    sequence: input.sequence,
    previousEnvelopeHash: input.previousEnvelopeHash,
    runtimeArtifactRef: input.runtimeArtifactRef,
    harnessId: input.harnessId,
    scenarioId: input.scenarioId,
    stateSnapshot: structuredClone(input.stateSnapshot),
    signatureInput: structuredClone(input.signatureInput),
    runtimeSignature: structuredClone(input.runtimeSignature),
    ancestry: [...input.ancestry],
    boundaries: [...input.boundaries],
    recordedAt: input.recordedAt,
    sourceMutation: input.sourceMutation,
  }
  const envelope: RecoveryEnvelope = {
    ...body,
    envelopeHash: recoveryEnvelopeHash(body),
  }
  return deepFreeze(envelope)
}

export function serializeRecoveryEnvelope(envelope: RecoveryEnvelope): string {
  return stableJson(envelope)
}

function fail(code: RecoveryCode, detail: string): RecoveryVerificationResult {
  return { code, valid: false, completeChainFreshness: false, detail }
}

function isSyntheticId(value: string | undefined, prefix: string): boolean {
  return typeof value === "string" && value.startsWith(prefix)
}

function hasLiveIdentity(state: InterfaceRuntimeState): boolean {
  if (state.activeHandoffId && !isSyntheticId(state.activeHandoffId, "TEST-HANDOFF-")) return true
  if (state.seedId && !isSyntheticId(state.seedId, "TEST-SEED-")) return true
  if (state.routeId && !isSyntheticId(state.routeId, "TEST-ROUTE-")) return true

  for (const [handoffId, packet] of Object.entries(state.packets)) {
    if (!isSyntheticId(handoffId, "TEST-HANDOFF-")) return true
    if (!isSyntheticId(packet.handoffId, "TEST-HANDOFF-")) return true
    if (!isSyntheticId(packet.sourcePositionIxId, "TEST-POSIX-")) return true
  }

  for (const [operationId, receipt] of Object.entries(state.admissionReceipts)) {
    if (!isSyntheticId(operationId, "TEST-OP-")) return true
    if (!isSyntheticId(receipt.operationId, "TEST-OP-")) return true
    if (!isSyntheticId(receipt.handoffId, "TEST-HANDOFF-")) return true
    if (!isSyntheticId(receipt.admissionAuthorityRef, "TEST-AUTH-")) return true
  }
  return false
}

function hasAutoRecoverySemantics(envelope: RecoveryEnvelope): boolean {
  const raw = envelope as unknown as Record<string, unknown>
  if (raw.autoRecover === true || typeof raw.resumeCommand === "string") return true
  const boundaryText = envelope.boundaries.join(" ").toLowerCase()
  return /\b(auto[ _-]?recover|resume[ _-]?command|auto[ _-]?admit|bind[ _-]?seed|commit[ _-]?route)\b/.test(boundaryText)
}

function hasRequiredBoundaries(envelope: RecoveryEnvelope): boolean {
  return REQUIRED_BOUNDARIES.every(boundary => envelope.boundaries.includes(boundary))
}

function snapshotsAgree(envelope: RecoveryEnvelope): boolean {
  return stableJson(envelope.stateSnapshot) === stableJson(envelope.signatureInput.finalState)
}

function receiptsAreValid(state: InterfaceRuntimeState): boolean {
  return Object.entries(state.admissionReceipts).every(([operationId, receipt]) =>
    validateAdmissionReceipt(state, operationId, receipt),
  )
}

function makeCandidate(envelope: RecoveryEnvelope): VerifiedRecoveryCandidate {
  return deepFreeze({
    envelopeId: envelope.envelopeId,
    sequence: envelope.sequence,
    runtimeArtifactRef: envelope.runtimeArtifactRef,
    stateSnapshot: structuredClone(envelope.stateSnapshot),
    runtimeSignature: structuredClone(envelope.runtimeSignature),
    ancestry: [...envelope.ancestry],
  })
}

export function verifyRecoveryEnvelope(
  envelope: RecoveryEnvelope,
  policy: RecoveryVerificationPolicy,
): RecoveryVerificationResult {
  if (envelope.schemaVersion !== RECOVERY_SCHEMA_VERSION) {
    return fail("RECOVERY-HOLD-UNSUPPORTED-SCHEMA", "Unsupported recovery schema")
  }
  if (!isSyntheticId(envelope.envelopeId, "TEST-RECOVERY-") ||
      !isSyntheticId(envelope.scenarioId, "TEST-FIXTURE-") ||
      envelope.harnessId !== POSIX_SE_NONPROD_HARNESS_001.harnessId ||
      hasLiveIdentity(envelope.stateSnapshot)) {
    return fail("RECOVERY-REFUSE-LIVE-ID", "Recovery v1 accepts synthetic non-production identities only")
  }
  if (envelope.sourceMutation !== "NONE") {
    return fail("RECOVERY-REFUSE-SOURCE-MUTATION", "Recovery envelope may not authorize source mutation")
  }
  if (!hasRequiredBoundaries(envelope) || hasAutoRecoverySemantics(envelope)) {
    return fail("RECOVERY-REFUSE-AUTO-RECOVERY", "Recovery envelope must preserve no-auto-recovery boundaries")
  }
  if (!Number.isInteger(envelope.sequence) || envelope.sequence < 0 ||
      (envelope.sequence === 0 && envelope.previousEnvelopeHash !== null) ||
      (envelope.sequence > 0 && !envelope.previousEnvelopeHash)) {
    return fail("RECOVERY-CONFLICT-SEQUENCE", "Invalid recovery sequence/genesis relationship")
  }
  if (!policy.allowedRuntimeArtifactRefs.includes(envelope.runtimeArtifactRef)) {
    return fail("RECOVERY-HOLD-BASELINE-MISMATCH", "Runtime artifact is not in the allowed recovery baseline set")
  }

  const { envelopeHash, ...body } = envelope
  if (recoveryEnvelopeHash(body) !== envelopeHash) {
    return fail("RECOVERY-INVALID-ENVELOPE-HASH", "Envelope SHA-256 digest does not match canonical content")
  }
  if (!snapshotsAgree(envelope)) {
    return fail("RECOVERY-CONFLICT-STATE-EVIDENCE", "State snapshot differs from signed canonical final state")
  }
  if (!verifyRuntimeSignature(envelope.signatureInput, envelope.runtimeSignature)) {
    return fail("RECOVERY-INVALID-SIGNATURE", "Runtime signature does not match canonical signature evidence")
  }
  if (!receiptsAreValid(envelope.stateSnapshot)) {
    return fail("RECOVERY-INVALID-RECEIPT", "At least one admission receipt fails current receipt validation")
  }
  if (envelope.ancestry.length === 0) {
    return fail("RECOVERY-CONFLICT-STATE-EVIDENCE", "Recovery ancestry is required")
  }

  return {
    code: "RECOVERY-VALID-CANDIDATE",
    valid: true,
    completeChainFreshness: false,
    candidate: makeCandidate(envelope),
  }
}

export function verifyRecoveryChain(
  envelopes: readonly RecoveryEnvelope[],
  policy: RecoveryVerificationPolicy,
  expectedCheckpoint?: RecoveryCheckpoint,
): RecoveryVerificationResult {
  if (envelopes.length === 0) {
    return fail("RECOVERY-CONFLICT-SEQUENCE", "Recovery chain is empty")
  }

  for (let index = 0; index < envelopes.length; index += 1) {
    const envelope = envelopes[index]
    const verified = verifyRecoveryEnvelope(envelope, policy)
    if (!verified.valid) return verified

    if (envelope.sequence !== index) {
      return fail("RECOVERY-CONFLICT-SEQUENCE", "Recovery chain sequence is not contiguous from genesis")
    }
    if (index === 0) {
      if (envelope.previousEnvelopeHash !== null) {
        return fail("RECOVERY-CONFLICT-PREV-HASH", "Genesis must not reference a prior envelope")
      }
    } else {
      const previous = envelopes[index - 1]
      if (envelope.previousEnvelopeHash !== previous.envelopeHash) {
        return fail("RECOVERY-CONFLICT-PREV-HASH", "Recovery envelope does not extend the verified predecessor")
      }
    }
  }

  const head = envelopes[envelopes.length - 1]
  if (!expectedCheckpoint) {
    return {
      code: "LOCAL_INTEGRITY_ONLY",
      valid: true,
      completeChainFreshness: false,
      candidate: makeCandidate(head),
      detail: "Local chain integrity verified without an external expected checkpoint",
    }
  }

  if (expectedCheckpoint.sequence !== head.sequence ||
      expectedCheckpoint.envelopeHash !== head.envelopeHash) {
    return fail("RECOVERY-CONFLICT-CHECKPOINT", "Verified local head differs from expected checkpoint")
  }

  return {
    code: "RECOVERY-VALID-CANDIDATE",
    valid: true,
    completeChainFreshness: true,
    candidate: makeCandidate(head),
  }
}
