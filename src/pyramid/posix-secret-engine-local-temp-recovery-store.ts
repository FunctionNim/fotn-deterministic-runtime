import { randomUUID } from "node:crypto"
import {
  constants,
  link,
  lstat,
  open,
  readFile,
  readdir,
  realpath,
  unlink,
} from "node:fs/promises"
import { isAbsolute, join, relative } from "node:path"
import {
  serializeRecoveryEnvelope,
  verifyRecoveryChain,
  verifyRecoveryEnvelope,
  type RecoveryCheckpoint,
  type RecoveryEnvelope,
  type RecoveryVerificationPolicy,
  type VerifiedRecoveryCandidate,
} from "./posix-secret-engine-recovery-envelope.js"

export const RECOVERY_STORE_SCHEMA_VERSION = "POSIX-SE-RECOVERY-STORE-1.0" as const

export type RecoveryStoreCode =
  | "STORE-OK-STORED"
  | "STORE-OK-ALREADY-STORED"
  | "STORE-VALID-CANDIDATE"
  | "STORE-LOCAL-INTEGRITY-ONLY"
  | "STORE-HOLD-UNSUPPORTED-SCHEMA"
  | "STORE-HOLD-BASELINE"
  | "STORE-HOLD-ORPHAN-STAGING"
  | "STORE-CONFLICT-HEAD-CHANGED"
  | "STORE-CONFLICT-SLOT"
  | "STORE-CONFLICT-FORK"
  | "STORE-CONFLICT-SEQUENCE"
  | "STORE-CONFLICT-PREV-HASH"
  | "STORE-CONFLICT-CHECKPOINT"
  | "STORE-CONFLICT-CHAIN"
  | "STORE-INVALID-RECORD"
  | "STORE-INVALID-READBACK"
  | "STORE-REFUSE-LIVE-ID"
  | "STORE-REFUSE-PATH"
  | "STORE-REFUSE-HISTORY-MUTATION"
  | "STORE-REFUSE-AUTO-RECOVERY"
  | "STORE-REFUSE-SOURCE-MUTATION"

export type RecoveryStoreEffect = "NONE" | "STORE_LOCAL"

export interface RecoveryStoreObservedHead {
  readonly sequence: number
  readonly envelopeHash: string
}

export interface RecoveryStoreConfig {
  readonly storeSchemaVersion?: typeof RECOVERY_STORE_SCHEMA_VERSION
  readonly storeId: string
  readonly chainId: string
  readonly root: string
  readonly expectedTestTempParent: string
  readonly recoveryPolicy: RecoveryVerificationPolicy
}

export interface RecoveryStoreResult {
  readonly code: RecoveryStoreCode
  readonly effect: RecoveryStoreEffect
  readonly observedHead?: RecoveryStoreObservedHead
  readonly candidate?: VerifiedRecoveryCandidate
  readonly detail?: string
  readonly diagnostics?: readonly string[]
}

export interface RecoveryStoreAppendOptions {
  readonly expectedObservedHead?: RecoveryStoreObservedHead
}

interface FinalizedRecord {
  readonly fileName: string
  readonly envelope: RecoveryEnvelope
  readonly canonicalBytes: string
}

interface ScannedStore {
  readonly records: readonly FinalizedRecord[]
  readonly observedHead?: RecoveryStoreObservedHead
  readonly orphanStaging: readonly string[]
}

const FINAL_RECORD_PATTERN = /^(\d{12})-([0-9a-f]{64})\.json$/
const STAGING_PREFIX = ".posix-se-store-"
const STAGING_SUFFIX = ".tmp"

function result(
  code: RecoveryStoreCode,
  effect: RecoveryStoreEffect = "NONE",
  detail?: string,
  extra: Omit<RecoveryStoreResult, "code" | "effect" | "detail"> = {},
): RecoveryStoreResult {
  return { code, effect, detail, ...extra }
}

function isSyntheticId(value: string, prefix: string): boolean {
  return value.startsWith(prefix) && value.length > prefix.length
}

function finalRecordName(envelope: RecoveryEnvelope): string {
  return `${String(envelope.sequence).padStart(12, "0")}-${envelope.envelopeHash}.json`
}

function sameHead(
  left: RecoveryStoreObservedHead | undefined,
  right: RecoveryStoreObservedHead | undefined,
): boolean {
  return left?.sequence === right?.sequence && left?.envelopeHash === right?.envelopeHash
}

function mapRecoveryFailure(code: string, detail?: string): RecoveryStoreResult {
  switch (code) {
    case "RECOVERY-HOLD-UNSUPPORTED-SCHEMA":
      return result("STORE-HOLD-UNSUPPORTED-SCHEMA", "NONE", detail)
    case "RECOVERY-HOLD-BASELINE-MISMATCH":
      return result("STORE-HOLD-BASELINE", "NONE", detail)
    case "RECOVERY-REFUSE-LIVE-ID":
      return result("STORE-REFUSE-LIVE-ID", "NONE", detail)
    case "RECOVERY-REFUSE-AUTO-RECOVERY":
      return result("STORE-REFUSE-AUTO-RECOVERY", "NONE", detail)
    case "RECOVERY-REFUSE-SOURCE-MUTATION":
      return result("STORE-REFUSE-SOURCE-MUTATION", "NONE", detail)
    case "RECOVERY-CONFLICT-SEQUENCE":
      return result("STORE-CONFLICT-SEQUENCE", "NONE", detail)
    case "RECOVERY-CONFLICT-PREV-HASH":
      return result("STORE-CONFLICT-PREV-HASH", "NONE", detail)
    case "RECOVERY-CONFLICT-CHECKPOINT":
      return result("STORE-CONFLICT-CHECKPOINT", "NONE", detail)
    default:
      return result("STORE-INVALID-RECORD", "NONE", detail ?? code)
  }
}

async function validateRoot(config: RecoveryStoreConfig): Promise<RecoveryStoreResult | { root: string }> {
  if ((config.storeSchemaVersion ?? RECOVERY_STORE_SCHEMA_VERSION) !== RECOVERY_STORE_SCHEMA_VERSION) {
    return result("STORE-HOLD-UNSUPPORTED-SCHEMA", "NONE", "Unsupported recovery-store schema")
  }
  if (!isSyntheticId(config.storeId, "TEST-STORE-") || !isSyntheticId(config.chainId, "TEST-CHAIN-")) {
    return result("STORE-REFUSE-LIVE-ID", "NONE", "Recovery store accepts TEST-STORE-* and TEST-CHAIN-* identities only")
  }

  try {
    const rootStat = await lstat(config.root)
    if (!rootStat.isDirectory() || rootStat.isSymbolicLink()) {
      return result("STORE-REFUSE-PATH", "NONE", "Store root must be a real caller-created directory, not a symlink")
    }

    const root = await realpath(config.root)
    const allowedParent = await realpath(config.expectedTestTempParent)
    const rel = relative(allowedParent, root)
    if (rel === "" || rel.startsWith("..") || isAbsolute(rel)) {
      return result("STORE-REFUSE-PATH", "NONE", "Store root must be a child of the explicitly supplied test-temp parent")
    }
    return { root }
  } catch {
    return result("STORE-REFUSE-PATH", "NONE", "Store root or expected test-temp parent is unavailable")
  }
}

async function readFinalRecord(
  root: string,
  fileName: string,
  policy: RecoveryVerificationPolicy,
): Promise<FinalizedRecord | RecoveryStoreResult> {
  const match = FINAL_RECORD_PATTERN.exec(fileName)
  if (!match) return result("STORE-INVALID-RECORD", "NONE", "Final record name does not match adapter namespace")

  const filePath = join(root, fileName)
  try {
    const stat = await lstat(filePath)
    if (!stat.isFile() || stat.isSymbolicLink()) {
      return result("STORE-REFUSE-PATH", "NONE", "Final recovery record must be a regular non-symlink file")
    }

    const bytes = await readFile(filePath, "utf8")
    let envelope: RecoveryEnvelope
    try {
      envelope = JSON.parse(bytes) as RecoveryEnvelope
    } catch {
      return result("STORE-INVALID-RECORD", "NONE", `Malformed JSON in ${fileName}`)
    }

    const expectedSequence = Number(match[1])
    const expectedHash = match[2]
    if (envelope.sequence !== expectedSequence || envelope.envelopeHash !== expectedHash) {
      return result("STORE-INVALID-RECORD", "NONE", `Filename/content identity mismatch in ${fileName}`)
    }

    let canonicalBytes: string
    try {
      canonicalBytes = serializeRecoveryEnvelope(envelope)
    } catch {
      return result("STORE-INVALID-RECORD", "NONE", `Envelope cannot be canonically serialized: ${fileName}`)
    }
    if (bytes !== canonicalBytes) {
      return result("STORE-INVALID-RECORD", "NONE", `Final record bytes are not canonical: ${fileName}`)
    }

    const verified = verifyRecoveryEnvelope(envelope, policy)
    if (!verified.valid) return mapRecoveryFailure(verified.code, verified.detail)

    return { fileName, envelope, canonicalBytes }
  } catch {
    return result("STORE-INVALID-RECORD", "NONE", `Unable to read finalized record ${fileName}`)
  }
}

async function scanStore(
  config: RecoveryStoreConfig,
): Promise<ScannedStore | RecoveryStoreResult> {
  const rootCheck = await validateRoot(config)
  if ("code" in rootCheck) return rootCheck
  const root = rootCheck.root

  let entries
  try {
    entries = await readdir(root, { withFileTypes: true })
  } catch {
    return result("STORE-REFUSE-PATH", "NONE", "Unable to enumerate store root")
  }

  const finalNames: string[] = []
  const orphanStaging: string[] = []
  for (const entry of entries) {
    if (FINAL_RECORD_PATTERN.test(entry.name)) {
      if (entry.isSymbolicLink()) {
        return result("STORE-REFUSE-PATH", "NONE", `Symlinked recovery record refused: ${entry.name}`)
      }
      finalNames.push(entry.name)
      continue
    }
    if (entry.name.startsWith(STAGING_PREFIX) && entry.name.endsWith(STAGING_SUFFIX)) {
      orphanStaging.push(entry.name)
    }
  }

  if (orphanStaging.length > 0) {
    return result("STORE-HOLD-ORPHAN-STAGING", "NONE", "Interrupted staging evidence detected", {
      diagnostics: [...orphanStaging].sort(),
    })
  }

  const records: FinalizedRecord[] = []
  for (const fileName of finalNames) {
    const loaded = await readFinalRecord(root, fileName, config.recoveryPolicy)
    if ("code" in loaded) return loaded
    records.push(loaded)
  }

  records.sort((a, b) => a.envelope.sequence - b.envelope.sequence)

  const seenEnvelopeIds = new Map<string, string>()
  for (let index = 0; index < records.length; index += 1) {
    const current = records[index]
    if (index > 0 && records[index - 1].envelope.sequence === current.envelope.sequence) {
      return result("STORE-CONFLICT-FORK", "NONE", `Multiple finalized records claim sequence ${current.envelope.sequence}`)
    }
    if (current.envelope.sequence !== index) {
      return result("STORE-CONFLICT-SEQUENCE", "NONE", "Finalized records do not form a contiguous sequence from genesis")
    }
    if (index === 0) {
      if (current.envelope.previousEnvelopeHash !== null) {
        return result("STORE-CONFLICT-PREV-HASH", "NONE", "Genesis record references a predecessor")
      }
    } else if (current.envelope.previousEnvelopeHash !== records[index - 1].envelope.envelopeHash) {
      return result("STORE-CONFLICT-PREV-HASH", "NONE", "Finalized record predecessor hash mismatch")
    }

    const priorHash = seenEnvelopeIds.get(current.envelope.envelopeId)
    if (priorHash && priorHash !== current.envelope.envelopeHash) {
      return result("STORE-CONFLICT-SLOT", "NONE", "Envelope identity is reused with different content")
    }
    seenEnvelopeIds.set(current.envelope.envelopeId, current.envelope.envelopeHash)
  }

  if (records.length > 0) {
    const chainVerified = verifyRecoveryChain(
      records.map(record => record.envelope),
      config.recoveryPolicy,
    )
    if (!chainVerified.valid) {
      return result("STORE-CONFLICT-CHAIN", "NONE", chainVerified.detail ?? chainVerified.code)
    }
  }

  const head = records.at(-1)?.envelope
  return {
    records,
    orphanStaging: [],
    observedHead: head ? { sequence: head.sequence, envelopeHash: head.envelopeHash } : undefined,
  }
}

async function reconcileExistingFinal(
  root: string,
  envelope: RecoveryEnvelope,
  canonicalBytes: string,
  policy: RecoveryVerificationPolicy,
): Promise<RecoveryStoreResult> {
  const name = finalRecordName(envelope)
  const loaded = await readFinalRecord(root, name, policy)
  if ("code" in loaded) return loaded
  if (loaded.canonicalBytes === canonicalBytes &&
      loaded.envelope.envelopeId === envelope.envelopeId &&
      loaded.envelope.envelopeHash === envelope.envelopeHash) {
    return result("STORE-OK-ALREADY-STORED", "NONE", "Exact canonical recovery record already exists", {
      observedHead: { sequence: envelope.sequence, envelopeHash: envelope.envelopeHash },
    })
  }
  return result("STORE-CONFLICT-SLOT", "NONE", "Final record slot exists with different material")
}

export class LocalTempRecoveryStore {
  readonly #config: RecoveryStoreConfig

  constructor(config: RecoveryStoreConfig) {
    this.#config = config
  }

  async append(
    envelope: RecoveryEnvelope,
    options: RecoveryStoreAppendOptions = {},
  ): Promise<RecoveryStoreResult> {
    const rootCheck = await validateRoot(this.#config)
    if ("code" in rootCheck) return rootCheck
    const root = rootCheck.root

    const verified = verifyRecoveryEnvelope(envelope, this.#config.recoveryPolicy)
    if (!verified.valid) return mapRecoveryFailure(verified.code, verified.detail)

    let canonicalBytes: string
    try {
      canonicalBytes = serializeRecoveryEnvelope(envelope)
    } catch {
      return result("STORE-INVALID-RECORD", "NONE", "Candidate envelope cannot be canonically serialized")
    }

    const scanned = await scanStore(this.#config)
    if ("code" in scanned) return scanned

    const exact = scanned.records.find(record =>
      record.envelope.sequence === envelope.sequence &&
      record.envelope.envelopeHash === envelope.envelopeHash,
    )
    if (exact) {
      if (exact.canonicalBytes === canonicalBytes && exact.envelope.envelopeId === envelope.envelopeId) {
        return result("STORE-OK-ALREADY-STORED", "NONE", "Exact canonical recovery record already exists", {
          observedHead: scanned.observedHead,
        })
      }
      return result("STORE-CONFLICT-SLOT", "NONE", "Sequence/hash slot exists with different material")
    }

    const identityConflict = scanned.records.find(record =>
      record.envelope.envelopeId === envelope.envelopeId &&
      record.envelope.envelopeHash !== envelope.envelopeHash,
    )
    if (identityConflict) {
      return result("STORE-CONFLICT-SLOT", "NONE", "Envelope identity already exists with different content")
    }

    if (scanned.records.length === 0) {
      if (envelope.sequence !== 0 || envelope.previousEnvelopeHash !== null) {
        return result("STORE-CONFLICT-SEQUENCE", "NONE", "Empty store accepts only a genesis envelope")
      }
    } else {
      if (!options.expectedObservedHead || !sameHead(options.expectedObservedHead, scanned.observedHead)) {
        return result("STORE-CONFLICT-HEAD-CHANGED", "NONE", "Caller observed-head precondition does not match current store head", {
          observedHead: scanned.observedHead,
        })
      }
      const head = scanned.records[scanned.records.length - 1].envelope
      if (envelope.sequence !== head.sequence + 1) {
        return result("STORE-CONFLICT-SEQUENCE", "NONE", "Descendant sequence must immediately follow current head")
      }
      if (envelope.previousEnvelopeHash !== head.envelopeHash) {
        return result("STORE-CONFLICT-PREV-HASH", "NONE", "Descendant does not reference current head")
      }
    }

    const finalName = finalRecordName(envelope)
    const finalPath = join(root, finalName)
    const stagingName = `${STAGING_PREFIX}${this.#config.storeId}-${randomUUID()}${STAGING_SUFFIX}`
    const stagingPath = join(root, stagingName)

    let handle
    try {
      handle = await open(stagingPath, constants.O_CREAT | constants.O_EXCL | constants.O_WRONLY, 0o600)
      await handle.writeFile(canonicalBytes, "utf8")
      await handle.sync()
      await handle.close()
      handle = undefined

      try {
        await link(stagingPath, finalPath)
      } catch (error) {
        const code = (error as NodeJS.ErrnoException).code
        await unlink(stagingPath).catch(() => undefined)
        if (code === "EEXIST") {
          return reconcileExistingFinal(root, envelope, canonicalBytes, this.#config.recoveryPolicy)
        }
        return result("STORE-INVALID-READBACK", "NONE", "Unable to finalize immutable recovery record")
      }

      await unlink(stagingPath)

      const readback = await readFinalRecord(root, finalName, this.#config.recoveryPolicy)
      if ("code" in readback) {
        return result("STORE-INVALID-READBACK", "NONE", readback.detail ?? readback.code)
      }
      if (readback.canonicalBytes !== canonicalBytes) {
        return result("STORE-INVALID-READBACK", "NONE", "Final readback bytes differ from canonical candidate")
      }

      return result("STORE-OK-STORED", "STORE_LOCAL", "Canonical recovery record finalized and readback verified", {
        observedHead: { sequence: envelope.sequence, envelopeHash: envelope.envelopeHash },
      })
    } catch {
      if (handle) await handle.close().catch(() => undefined)
      return result("STORE-INVALID-READBACK", "NONE", "Recovery record staging/finalization failed")
    }
  }

  async loadVerifiedChain(
    expectedCheckpoint?: RecoveryCheckpoint,
  ): Promise<RecoveryStoreResult> {
    const scanned = await scanStore(this.#config)
    if ("code" in scanned) return scanned
    if (scanned.records.length === 0) {
      return result("STORE-CONFLICT-SEQUENCE", "NONE", "Recovery store contains no finalized genesis record")
    }

    const verified = verifyRecoveryChain(
      scanned.records.map(record => record.envelope),
      this.#config.recoveryPolicy,
      expectedCheckpoint,
    )
    if (!verified.valid) {
      if (verified.code === "RECOVERY-CONFLICT-CHECKPOINT") {
        return result("STORE-CONFLICT-CHECKPOINT", "NONE", verified.detail, {
          observedHead: scanned.observedHead,
        })
      }
      return result("STORE-CONFLICT-CHAIN", "NONE", verified.detail ?? verified.code)
    }

    if (verified.code === "LOCAL_INTEGRITY_ONLY") {
      return result("STORE-LOCAL-INTEGRITY-ONLY", "NONE", verified.detail, {
        observedHead: scanned.observedHead,
        candidate: verified.candidate,
      })
    }

    return result("STORE-VALID-CANDIDATE", "NONE", "Verified chain matches caller-supplied expected checkpoint", {
      observedHead: scanned.observedHead,
      candidate: verified.candidate,
    })
  }
}
