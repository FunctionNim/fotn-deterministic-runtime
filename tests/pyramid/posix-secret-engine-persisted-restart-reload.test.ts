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
} from "../../src/pyramid/posix-secret-engine-local-temp-recovery-store.js"
import {
  PERSISTED_RESTART_SCHEMA_VERSION,
  persistedRestartPacketHash,
  preparePersistedRestart,
  type PersistedRestartInput,
  type RestartCandidatePacket,
} from "../../src/pyramid/posix-secret-engine-persisted-restart-reload.js"
import * as persistedRestartModule from "../../src/pyramid/posix-secret-engine-persisted-restart-reload.js"

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
  })

  it("PRR-003 refuses missing external checkpoint before any store-readiness path", async () => {
    const store = makeStore()
    const outcome = await preparePersistedRestart(store, {
      restartSessionId: "TEST-RESTART-MISSING-CHECKPOINT",
      createdAt: "UNKNOWN",
      allowedRuntimeArtifactRefs: [RUNTIME_BASELINE],
    })

    expect(outcome.code).toBe("RESTART-HOLD-CHECKPOINT-REQUIRED")
  })

  it("PRR-006 local-only evidence remains inspectable but cannot bypass external checkpoint readiness", async () => {
    const store = makeStore()
    const envelope = makeEnvelope("TEST-RECOVERY-RESTART-LOCAL")
    await store.append(envelope)

    const local = await store.loadVerifiedChain()
    expect(local.code).toBe("STORE-LOCAL-INTEGRITY-ONLY")

    const outcome = await preparePersistedRestart(store, {
      restartSessionId: "TEST-RESTART-LOCAL-NO-CHECKPOINT",
      createdAt: "UNKNOWN",
      allowedRuntimeArtifactRefs: [RUNTIME_BASELINE],
    })
    expect(outcome.code).toBe("RESTART-HOLD-CHECKPOINT-REQUIRED")
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

  it("PRR-002 refuses live restart identity before readiness", async () => {
    const envelope = makeEnvelope("TEST-RECOVERY-RESTART-LIVE")
    const store = makeStore()

    const outcome = await preparePersistedRestart(store, {
      ...restartInput(envelope),
      restartSessionId: "LIVE-RESTART-001",
    })
    expect(outcome.code).toBe("RESTART-REFUSE-LIVE-ID")
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
    const store = makeStore()
    const raw = {
      ...restartInput(envelope),
      [key]: value,
    }

    const outcome = await preparePersistedRestart(store, raw)
    expect(outcome.code).toBe("RESTART-REFUSE-INSTALLATION")
  })

  it.each([
    ["append", true],
    ["delete", true],
    ["cleanup", true],
    ["repair", true],
  ])("PRR-023 rejects raw store-mutation field %s", async (key, value) => {
    const envelope = makeEnvelope(`TEST-RECOVERY-RESTART-STORE-MUT-${key}`)
    const store = makeStore()
    const outcome = await preparePersistedRestart(store, {
      ...restartInput(envelope),
      [key]: value,
    })

    expect(outcome.code).toBe("RESTART-REFUSE-STORE-MUTATION")
  })

  it("PRR-024 rejects sourceMutation field in adversarial raw input", async () => {
    const envelope = makeEnvelope("TEST-RECOVERY-RESTART-SOURCE-MUT")
    const store = makeStore()
    const outcome = await preparePersistedRestart(store, {
      ...restartInput(envelope),
      sourceMutation: "WRITE",
    })

    expect(outcome.code).toBe("RESTART-REFUSE-SOURCE-MUTATION")
  })

  it("RC-PR06 rejects a plain structural reader forged as LocalTempRecoveryStore", async () => {
    const envelope = makeEnvelope("TEST-RECOVERY-RESTART-FORGED-READER")
    let calls = 0
    const forged = {
      async loadVerifiedChain() {
        calls += 1
        return {
          code: "STORE-VALID-CANDIDATE",
          effect: "NONE",
          observedHead: { sequence: 0, envelopeHash: envelope.envelopeHash },
        }
      },
    } as unknown as LocalTempRecoveryStore

    const outcome = await preparePersistedRestart(forged, restartInput(envelope))
    expect(outcome.code).toBe("RESTART-INVALID-STORE-EVIDENCE")
    expect(calls).toBe(0)
  })

  it("RC-PR06 rejects a branded store whose promoted verification method is shadowed", async () => {
    const envelope = makeEnvelope("TEST-RECOVERY-RESTART-SHADOWED-STORE")
    const store = makeStore()
    let calls = 0
    ;(store as unknown as { loadVerifiedChain: () => Promise<unknown> }).loadVerifiedChain = async () => {
      calls += 1
      return {
        code: "STORE-VALID-CANDIDATE",
        effect: "NONE",
        observedHead: { sequence: 0, envelopeHash: envelope.envelopeHash },
      }
    }

    const outcome = await preparePersistedRestart(store, restartInput(envelope))
    expect(outcome.code).toBe("RESTART-INVALID-STORE-EVIDENCE")
    expect(calls).toBe(0)
  })

  it("RC2-PR04 rejects global prototype verifier replacement and restores it safely", async () => {
    const envelope = makeEnvelope("TEST-RECOVERY-RESTART-PROTOTYPE-FORGERY")
    const store = makeStore()
    const original = LocalTempRecoveryStore.prototype.loadVerifiedChain
    let forgedCalls = 0

    try {
      LocalTempRecoveryStore.prototype.loadVerifiedChain = async function () {
        forgedCalls += 1
        return {
          code: "STORE-VALID-CANDIDATE",
          effect: "NONE",
          observedHead: {
            sequence: envelope.sequence,
            envelopeHash: envelope.envelopeHash,
          },
          candidate: {
            envelopeId: envelope.envelopeId,
            sequence: envelope.sequence,
            runtimeArtifactRef: envelope.runtimeArtifactRef,
            stateSnapshot: envelope.stateSnapshot,
            runtimeSignature: envelope.runtimeSignature,
            ancestry: envelope.ancestry,
          },
        }
      }

      const outcome = await preparePersistedRestart(store, restartInput(envelope))
      expect(outcome.code).toBe("RESTART-INVALID-STORE-EVIDENCE")
      expect(outcome.packet).toBeUndefined()
      expect(forgedCalls).toBe(0)
    } finally {
      LocalTempRecoveryStore.prototype.loadVerifiedChain = original
    }

    expect(LocalTempRecoveryStore.prototype.loadVerifiedChain).toBe(original)
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

  it("RC-PR05 exposes no standalone packet verifier that can mint restart readiness", async () => {
    expect(
      (persistedRestartModule as unknown as Record<string, unknown>).verifyRestartCandidatePacket,
    ).toBeUndefined()

    const store = makeStore()
    const envelope = makeEnvelope("TEST-RECOVERY-RESTART-FORGED-PACKET")
    const forged = {
      schemaVersion: PERSISTED_RESTART_SCHEMA_VERSION,
      canonicalVersion: "POSIX-SE-RESTART-PACKET-CANONICAL-1",
      restartSessionId: "TEST-RESTART-FORGED-PACKET",
      expectedCheckpoint: {
        sequence: envelope.sequence,
        envelopeHash: envelope.envelopeHash,
      },
      createdAt: "UNKNOWN",
      allowedRuntimeArtifactRefs: [RUNTIME_BASELINE],
      sourceCheckpoint: {
        sequence: envelope.sequence,
        envelopeHash: envelope.envelopeHash,
      },
      envelopeId: envelope.envelopeId,
      sequence: envelope.sequence,
      runtimeArtifactRef: envelope.runtimeArtifactRef,
      stateSnapshot: envelope.stateSnapshot,
      runtimeSignature: envelope.runtimeSignature,
      ancestry: envelope.ancestry,
      boundaries: [
        "NON_PRODUCTION_ONLY",
        "NO_RUNTIME_INSTALL",
        "SOURCE_MUTATION_NONE",
        "CHECKPOINT_REQUIRED",
      ],
    } as Record<string, unknown>

    const outcome = await preparePersistedRestart(store, forged)
    expect(outcome.code).not.toBe("RESTART-READY-CANDIDATE")
    expect(outcome.packet).toBeUndefined()
  })
})
