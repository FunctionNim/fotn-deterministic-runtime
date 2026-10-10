import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { createInterfaceState } from "../../src/pyramid/posix-secret-engine-interface.js"
import {
  canonicalHappyPath,
  createDefaultNonprodFixture,
  runNonprodScenario,
  type HarnessCommand,
  type HarnessRunResult,
} from "../../src/pyramid/posix-secret-engine-nonprod-harness.js"
import type { RuntimeSignatureInput } from "../../src/runtime-signature/runtime-signature.js"
import {
  createRecoveryEnvelope,
  serializeRecoveryEnvelope,
  type RecoveryEnvelope,
  type RecoveryVerificationPolicy,
} from "../../src/pyramid/posix-secret-engine-recovery-envelope.js"
import {
  LocalTempRecoveryStore,
  RECOVERY_STORE_SCHEMA_VERSION,
  type RecoveryStoreResult,
} from "../../src/pyramid/posix-secret-engine-local-temp-recovery-store.js"
import {
  PERSISTED_RESTART_SCHEMA_VERSION,
  persistedRestartPacketHash,
  preparePersistedRestart,
  verifyRestartCandidatePacket,
  type PersistedRestartInput,
  type PersistedRestartStoreReader,
  type RestartCandidatePacket,
} from "../../src/pyramid/posix-secret-engine-persisted-restart-reload.js"

const RUNTIME_BASELINE = "308a8f4e270a56adc728712b177a347252c22abc"
const policy: RecoveryVerificationPolicy = {
  allowedRuntimeArtifactRefs: [RUNTIME_BASELINE],
}

function signatureInputFromRun(result: HarnessRunResult): RuntimeSignatureInput {
  return {
    scenarioId: result.fixtureId,
    initialState: createInterfaceState() as unknown as Readonly<Record<string, unknown>>,
    orderedActions: result.receipts.map(receipt => ({
      label: `${receipt.command}:${receipt.code}`,
      index: receipt.index,
    })),
    finalState: result.finalState as unknown as Readonly<Record<string, unknown>>,
    auditTrail: result.receipts.map(receipt =>
      [
        receipt.index,
        receipt.command,
        receipt.code,
        receipt.engineEffect,
        receipt.stateBefore,
        receipt.stateAfter,
      ].join("|"),
    ),
    memoryIds: null,
  }
}

function commandsForUnknown(operationId: string): readonly HarnessCommand[] {
  return [
    { type: "EMIT_HANDOFF" },
    { type: "OBSERVE" },
    { type: "VALIDATE" },
    {
      type: "ADMIT",
      authorityRef: "TEST-AUTH-VALID",
      operationId,
      commitOutcome: "UNKNOWN",
    },
  ]
}

function commandsForCommitted(operationId: string): readonly HarnessCommand[] {
  return [
    { type: "EMIT_HANDOFF" },
    { type: "OBSERVE" },
    { type: "VALIDATE" },
    {
      type: "ADMIT",
      authorityRef: "TEST-AUTH-VALID",
      operationId,
      commitOutcome: "COMMIT",
    },
  ]
}

function makeEnvelope(
  envelopeId: string,
  options: {
    commands?: readonly HarnessCommand[]
    sequence?: number
    previousEnvelopeHash?: string | null
    runtimeArtifactRef?: string
    fixtureId?: string
    ancestry?: readonly string[]
  } = {},
): RecoveryEnvelope {
  const fixture = createDefaultNonprodFixture(
    options.fixtureId ? { fixtureId: options.fixtureId } : {},
  )
  const result = runNonprodScenario(fixture, options.commands ?? canonicalHappyPath())
  const signatureInput = signatureInputFromRun(result)
  return createRecoveryEnvelope({
    envelopeId,
    sequence: options.sequence ?? 0,
    previousEnvelopeHash: options.previousEnvelopeHash ?? null,
    runtimeArtifactRef: options.runtimeArtifactRef ?? RUNTIME_BASELINE,
    harnessId: result.harnessId,
    scenarioId: result.fixtureId,
    stateSnapshot: result.finalState,
    signatureInput,
    runtimeSignature: result.signature,
    ancestry: options.ancestry ?? ["Pyramid-Talaru:222", "PersistedRestartContract:221A"],
    boundaries: ["NON_PRODUCTION_ONLY", "SOURCE_MUTATION_NONE", "NO_AUTO_RECOVERY"],
    recordedAt: "2026-10-10T00:00:00Z",
    sourceMutation: "NONE",
  })
}

function recordName(envelope: RecoveryEnvelope): string {
  return `${String(envelope.sequence).padStart(12, "0")}-${envelope.envelopeHash}.json`
}

function restartInput(envelope: RecoveryEnvelope, overrides: Record<string, unknown> = {}): PersistedRestartInput {
  return {
    schemaVersion: PERSISTED_RESTART_SCHEMA_VERSION,
    restartSessionId: "TEST-RESTART-001",
    expectedCheckpoint: {
      sequence: envelope.sequence,
      envelopeHash: envelope.envelopeHash,
    },
    createdAt: "2026-10-10T01:02:03Z",
    allowedRuntimeArtifactRefs: [RUNTIME_BASELINE],
    ...overrides,
  } as PersistedRestartInput
}

describe("POSITION IX → Secret Engine persisted restart/reload integration contract 001", () => {
  let parent: string
  let root: string

  beforeEach(async () => {
    parent = await mkdtemp(join(tmpdir(), "posix-se-restart-parent-"))
    root = join(parent, "store")
    await mkdir(root)
  })

  afterEach(async () => {
    await rm(parent, { recursive: true, force: true })
  })

  function makeStore(overrides: Partial<ConstructorParameters<typeof LocalTempRecoveryStore>[0]> = {}) {
    return new LocalTempRecoveryStore({
      storeSchemaVersion: RECOVERY_STORE_SCHEMA_VERSION,
      storeId: "TEST-STORE-RESTART-001",
      chainId: "TEST-CHAIN-RESTART-001",
      root,
      expectedTestTempParent: parent,
      recoveryPolicy: policy,
      ...overrides,
    })
  }

  it("PRR-003/006 requires external checkpoint and returns restart-ready packet only for STORE-VALID-CANDIDATE", async () => {
    const store = makeStore()
    const envelope = makeEnvelope("TEST-RECOVERY-RESTART-READY")
    expect((await store.append(envelope)).code).toBe("STORE-OK-STORED")

    const outcome = await preparePersistedRestart(store, restartInput(envelope))
    expect(outcome.code).toBe("RESTART-READY-CANDIDATE")
    expect(outcome.effect).toBe("NONE")
    expect(outcome.packet?.sourceCheckpoint).toEqual({
      sequence: 0,
      envelopeHash: envelope.envelopeHash,
    })
    expect(outcome.packet?.envelopeId).toBe(envelope.envelopeId)
    expect(outcome.packet?.runtimeArtifactRef).toBe(RUNTIME_BASELINE)
    expect(Object.isFrozen(outcome.packet)).toBe(true)
    expect(Object.isFrozen(outcome.packet?.stateSnapshot)).toBe(true)
  })

  it("PRR-015 preserves UNKNOWN_OUTCOME exactly without reconciliation", async () => {
    const store = makeStore()
    const envelope = makeEnvelope("TEST-RECOVERY-RESTART-UNKNOWN", {
      commands: commandsForUnknown("TEST-OP-RESTART-UNKNOWN"),
    })
    await store.append(envelope)

    const outcome = await preparePersistedRestart(store, restartInput(envelope))
    expect(outcome.code).toBe("RESTART-READY-CANDIDATE")
    expect(outcome.packet?.stateSnapshot.state).toBe("UNKNOWN_OUTCOME")
    expect(
      outcome.packet?.stateSnapshot.admissionReceipts["TEST-OP-RESTART-UNKNOWN"].decision,
    ).toBe("UNKNOWN")
  })

  it("PRR-016 preserves committed admission evidence without replay or downgrade", async () => {
    const store = makeStore()
    const envelope = makeEnvelope("TEST-RECOVERY-RESTART-COMMITTED", {
      commands: commandsForCommitted("TEST-OP-RESTART-COMMITTED"),
    })
    await store.append(envelope)

    const outcome = await preparePersistedRestart(store, restartInput(envelope))
    expect(outcome.code).toBe("RESTART-READY-CANDIDATE")
    expect(outcome.packet?.stateSnapshot.state).toBe("ADMITTED")
    expect(
      outcome.packet?.stateSnapshot.admissionReceipts["TEST-OP-RESTART-COMMITTED"].decision,
    ).toBe("COMMITTED")
  })

  it("PRR-017 carries routed seed/route state only as historical packet evidence", async () => {
    const store = makeStore()
    const envelope = makeEnvelope("TEST-RECOVERY-RESTART-ROUTED")
    await store.append(envelope)

    const outcome = await preparePersistedRestart(store, restartInput(envelope))
    expect(outcome.code).toBe("RESTART-READY-CANDIDATE")
    expect(outcome.packet?.stateSnapshot.state).toBe("ROUTED")
    expect(outcome.packet?.stateSnapshot.seedId).toBe("TEST-SEED-001")
    expect(outcome.packet?.stateSnapshot.routeId).toBe("TEST-ROUTE-001")
    expect((outcome as unknown as Record<string, unknown>).installedState).toBeUndefined()
  })

  it("PRR-026 builds the same semantic packet for identical explicit inputs", async () => {
    const store = makeStore()
    const envelope = makeEnvelope("TEST-RECOVERY-RESTART-DETERMINISTIC")
    await store.append(envelope)
    const input = restartInput(envelope)

    const first = await preparePersistedRestart(store, input)
    const second = await preparePersistedRestart(store, input)
    expect(first.code).toBe("RESTART-READY-CANDIDATE")
    expect(second.code).toBe("RESTART-READY-CANDIDATE")
    expect(second.packet).toEqual(first.packet)
    expect(second.packet?.packetHash).toBe(first.packet?.packetHash)
  })

  it("PRR-018 restart packet hash is separate SHA-256 over canonical packet body", async () => {
    const store = makeStore()
    const envelope = makeEnvelope("TEST-RECOVERY-RESTART-HASH")
    await store.append(envelope)
    const outcome = await preparePersistedRestart(store, restartInput(envelope))
    const packet = outcome.packet as RestartCandidatePacket
    const { packetHash, ...body } = packet

    expect(packetHash).toMatch(/^[0-9a-f]{64}$/)
    expect(packetHash).toBe(persistedRestartPacketHash(body))
    expect(verifyRestartCandidatePacket(packet).code).toBe("RESTART-READY-CANDIDATE")
  })

  it("PRR-003 refuses missing external checkpoint before consulting store", async () => {
    let calls = 0
    const store: PersistedRestartStoreReader = {
      async loadVerifiedChain() {
        calls += 1
        throw new Error("must not be called")
      },
    }
    const outcome = await preparePersistedRestart(store, {
      restartSessionId: "TEST-RESTART-MISSING-CHECKPOINT",
      createdAt: "UNKNOWN",
      allowedRuntimeArtifactRefs: [RUNTIME_BASELINE],
    })

    expect(outcome.code).toBe("RESTART-HOLD-CHECKPOINT-REQUIRED")
    expect(calls).toBe(0)
  })

  it("PRR-006 treats LOCAL_INTEGRITY_ONLY as non-restart-ready", async () => {
    const envelope = makeEnvelope("TEST-RECOVERY-RESTART-LOCAL")
    const store: PersistedRestartStoreReader = {
      async loadVerifiedChain(): Promise<RecoveryStoreResult> {
        return {
          code: "STORE-LOCAL-INTEGRITY-ONLY",
          effect: "NONE",
          observedHead: { sequence: 0, envelopeHash: envelope.envelopeHash },
          detail: "local only",
        }
      },
    }

    const outcome = await preparePersistedRestart(store, restartInput(envelope))
    expect(outcome.code).toBe("RESTART-HOLD-LOCAL-INTEGRITY-ONLY")
    expect(outcome.packet).toBeUndefined()
  })

  it("PRR-007/010 refuses stale external checkpoint before packet creation", async () => {
    const store = makeStore()
    const envelope = makeEnvelope("TEST-RECOVERY-RESTART-STALE")
    await store.append(envelope)

    const outcome = await preparePersistedRestart(store, {
      ...restartInput(envelope),
      expectedCheckpoint: { sequence: 0, envelopeHash: "a".repeat(64) },
    })
    expect(outcome.code).toBe("RESTART-CONFLICT-CHECKPOINT")
    expect(outcome.packet).toBeUndefined()
  })

  it("PRR-007 maps malformed/corrupt finalized store evidence to invalid store evidence", async () => {
    const store = makeStore()
    const envelope = makeEnvelope("TEST-RECOVERY-RESTART-CORRUPT")
    await store.append(envelope)
    await writeFile(join(root, recordName(envelope)), "{}", "utf8")

    const outcome = await preparePersistedRestart(store, restartInput(envelope))
    expect(outcome.code).toBe("RESTART-INVALID-STORE-EVIDENCE")
  })

  it("PRR-007 maps orphan staging to restart HOLD", async () => {
    const store = makeStore()
    const envelope = makeEnvelope("TEST-RECOVERY-RESTART-ORPHAN")
    await store.append(envelope)
    await writeFile(join(root, ".posix-se-store-TEST-STORE-RESTART-001-orphan.tmp"), "partial", "utf8")

    const outcome = await preparePersistedRestart(store, restartInput(envelope))
    expect(outcome.code).toBe("RESTART-HOLD-ORPHAN-STAGING")
  })

  it("PRR-009 independently enforces explicit restart baseline policy", async () => {
    const store = makeStore()
    const envelope = makeEnvelope("TEST-RECOVERY-RESTART-BASELINE")
    await store.append(envelope)

    const outcome = await preparePersistedRestart(store, {
      ...restartInput(envelope),
      allowedRuntimeArtifactRefs: ["TEST-OTHER-BASELINE"],
    })
    expect(outcome.code).toBe("RESTART-HOLD-BASELINE")
    expect(outcome.packet).toBeUndefined()
  })

  it("PRR-002 refuses live restart identity before store load", async () => {
    const envelope = makeEnvelope("TEST-RECOVERY-RESTART-LIVE")
    let calls = 0
    const store: PersistedRestartStoreReader = {
      async loadVerifiedChain() {
        calls += 1
        return { code: "STORE-VALID-CANDIDATE", effect: "NONE" }
      },
    }

    const outcome = await preparePersistedRestart(store, {
      ...restartInput(envelope),
      restartSessionId: "LIVE-RESTART-001",
    })
    expect(outcome.code).toBe("RESTART-REFUSE-LIVE-ID")
    expect(calls).toBe(0)
  })

  it.each([
    ["activeRuntime", {}],
    ["installState", {}],
    ["resume", true],
    ["reconcile", true],
    ["admit", true],
    ["bindSeed", true],
    ["evaluateRoute", true],
    ["commitRoute", true],
    ["Return", true],
  ])("PRR-021/022 rejects raw installation or runtime-command field %s", async (key, value) => {
    const envelope = makeEnvelope(`TEST-RECOVERY-RESTART-REFUSE-${key}`)
    let calls = 0
    const store: PersistedRestartStoreReader = {
      async loadVerifiedChain() {
        calls += 1
        return { code: "STORE-VALID-CANDIDATE", effect: "NONE" }
      },
    }
    const raw = {
      ...restartInput(envelope),
      [key]: value,
    }

    const outcome = await preparePersistedRestart(store, raw)
    expect(outcome.code).toBe("RESTART-REFUSE-INSTALLATION")
    expect(calls).toBe(0)
  })

  it.each([
    ["append", true],
    ["delete", true],
    ["cleanup", true],
    ["repair", true],
  ])("PRR-023 rejects raw store-mutation field %s", async (key, value) => {
    const envelope = makeEnvelope(`TEST-RECOVERY-RESTART-STORE-MUT-${key}`)
    const store: PersistedRestartStoreReader = {
      async loadVerifiedChain() {
        throw new Error("must not be called")
      },
    }
    const outcome = await preparePersistedRestart(store, {
      ...restartInput(envelope),
      [key]: value,
    })

    expect(outcome.code).toBe("RESTART-REFUSE-STORE-MUTATION")
  })

  it("PRR-024 rejects sourceMutation field in adversarial raw input", async () => {
    const envelope = makeEnvelope("TEST-RECOVERY-RESTART-SOURCE-MUT")
    const store: PersistedRestartStoreReader = {
      async loadVerifiedChain() {
        throw new Error("must not be called")
      },
    }
    const outcome = await preparePersistedRestart(store, {
      ...restartInput(envelope),
      sourceMutation: "WRITE",
    })

    expect(outcome.code).toBe("RESTART-REFUSE-SOURCE-MUTATION")
  })

  it("PRR-008 defensively rejects STORE-VALID-CANDIDATE without matching head/candidate", async () => {
    const envelope = makeEnvelope("TEST-RECOVERY-RESTART-DEFENSIVE")
    const store: PersistedRestartStoreReader = {
      async loadVerifiedChain() {
        return {
          code: "STORE-VALID-CANDIDATE",
          effect: "NONE",
          observedHead: { sequence: 0, envelopeHash: envelope.envelopeHash },
        }
      },
    }

    const outcome = await preparePersistedRestart(store, restartInput(envelope))
    expect(outcome.code).toBe("RESTART-CONFLICT-CANDIDATE")
  })

  it("PRR-010/013 packet ancestry carries source lineage, restart attempt, and checkpoint identity", async () => {
    const store = makeStore()
    const envelope = makeEnvelope("TEST-RECOVERY-RESTART-ANCESTRY", {
      ancestry: ["PositionIX", "Pyramid-Talaru:222"],
    })
    await store.append(envelope)

    const input = restartInput(envelope, { restartSessionId: "TEST-RESTART-ANCESTRY" })
    const outcome = await preparePersistedRestart(store, input)
    expect(outcome.code).toBe("RESTART-READY-CANDIDATE")
    expect(outcome.packet?.ancestry).toEqual([
      "PositionIX",
      "Pyramid-Talaru:222",
      "restartAttempt:TEST-RESTART-ANCESTRY",
      `checkpoint:0:${envelope.envelopeHash}`,
    ])
  })

  it("PRR-010 effect remains NONE and reload leaves persisted bytes unchanged", async () => {
    const store = makeStore()
    const envelope = makeEnvelope("TEST-RECOVERY-RESTART-READONLY")
    await store.append(envelope)
    const path = join(root, recordName(envelope))
    const before = await readFile(path, "utf8")

    const outcome = await preparePersistedRestart(store, restartInput(envelope))
    const after = await readFile(path, "utf8")

    expect(outcome.code).toBe("RESTART-READY-CANDIDATE")
    expect(outcome.effect).toBe("NONE")
    expect(after).toBe(before)
    expect(after).toBe(serializeRecoveryEnvelope(envelope))
  })

  it("PRR-028 exposes no install/resume/reconcile/admit/seed/route API from result or module contract", async () => {
    const store = makeStore()
    const envelope = makeEnvelope("TEST-RECOVERY-RESTART-NO-INSTALL")
    await store.append(envelope)
    const outcome = await preparePersistedRestart(store, restartInput(envelope))
    const record = outcome as unknown as Record<string, unknown>

    expect(record.install).toBeUndefined()
    expect(record.restore).toBeUndefined()
    expect(record.resume).toBeUndefined()
    expect(record.reconcile).toBeUndefined()
    expect(record.admit).toBeUndefined()
    expect(record.bindSeed).toBeUndefined()
    expect(record.commitRoute).toBeUndefined()
  })

  it("verifyRestartCandidatePacket refuses tampered packet hash", async () => {
    const store = makeStore()
    const envelope = makeEnvelope("TEST-RECOVERY-RESTART-TAMPER-PACKET")
    await store.append(envelope)
    const outcome = await preparePersistedRestart(store, restartInput(envelope))
    const packet = structuredClone(outcome.packet) as RestartCandidatePacket
    ;(packet as unknown as { createdAt: string }).createdAt = "tampered"

    expect(verifyRestartCandidatePacket(packet).code).toBe("RESTART-INVALID-PACKET-HASH")
  })
})
