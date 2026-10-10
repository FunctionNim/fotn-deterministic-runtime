import { mkdtemp, mkdir, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { createInterfaceState } from "../../src/pyramid/posix-secret-engine-interface.js"
import {
  canonicalHappyPath,
  createDefaultNonprodFixture,
  runNonprodScenario,
  type HarnessRunResult,
} from "../../src/pyramid/posix-secret-engine-nonprod-harness.js"
import type { RuntimeSignatureInput } from "../../src/runtime-signature/runtime-signature.js"
import {
  createRecoveryEnvelope,
  type RecoveryEnvelope,
  type RecoveryVerificationPolicy,
} from "../../src/pyramid/posix-secret-engine-recovery-envelope.js"
import {
  LocalTempRecoveryStore,
  RECOVERY_STORE_SCHEMA_VERSION,
} from "../../src/pyramid/posix-secret-engine-local-temp-recovery-store.js"
import {
  preparePersistedRestart,
  type RestartCandidatePacket,
} from "../../src/pyramid/posix-secret-engine-persisted-restart-reload.js"
import {
  RESTART_INSTALL_SCHEMA_VERSION,
  SyntheticRestartInstallTarget,
  installRestartCandidate,
} from "../../src/pyramid/posix-secret-engine-restart-install-gate.js"
import {
  POSTINSTALL_REENTRY_SCHEMA_VERSION,
  SyntheticPostInstallReentrySession,
  dispatchPostInstallReentryCommand,
} from "../../src/pyramid/posix-secret-engine-postinstall-reentry.js"

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

function makeEnvelope(label: string): RecoveryEnvelope {
  const fixture = createDefaultNonprodFixture({
    fixtureId: `TEST-FIXTURE-E2E-CONTINUITY-${label}`,
  })
  const result = runNonprodScenario(fixture, canonicalHappyPath())
  return createRecoveryEnvelope({
    envelopeId: `TEST-RECOVERY-E2E-CONTINUITY-${label}`,
    sequence: 0,
    previousEnvelopeHash: null,
    runtimeArtifactRef: RUNTIME_BASELINE,
    harnessId: result.harnessId,
    scenarioId: result.fixtureId,
    stateSnapshot: result.finalState,
    signatureInput: signatureInputFromRun(result),
    runtimeSignature: result.signature,
    ancestry: [
      "Pyramid-Talaru:270",
      "Pyramid-Talaru:274A",
      "E2E-CONFORMANCE-RECEIPT-HARNESS-001",
    ],
    boundaries: [
      "NON_PRODUCTION_ONLY",
      "SOURCE_MUTATION_NONE",
      "NO_AUTO_RECOVERY",
    ],
    recordedAt: "2026-10-10T10:30:00Z",
    sourceMutation: "NONE",
  })
}

describe("POSITION IX → Secret Engine recovery-to-re-entry end-to-end conformance receipt harness 001", () => {
  let parent: string
  let counter = 0

  beforeEach(async () => {
    parent = await mkdtemp(join(tmpdir(), "posix-se-e2e-continuity-parent-"))
  })

  afterEach(async () => {
    await rm(parent, { recursive: true, force: true })
  })

  async function storedEnvelope(label: string) {
    counter += 1
    const envelope = makeEnvelope(`${label}-${counter}`)
    const root = join(parent, `store-${counter}`)
    await mkdir(root)
    const store = new LocalTempRecoveryStore({
      storeSchemaVersion: RECOVERY_STORE_SCHEMA_VERSION,
      storeId: `TEST-STORE-E2E-CONTINUITY-${counter}`,
      chainId: `TEST-CHAIN-E2E-CONTINUITY-${counter}`,
      root,
      expectedTestTempParent: parent,
      recoveryPolicy: policy,
    })
    expect((await store.append(envelope)).code).toBe("STORE-OK-STORED")
    return { envelope, store }
  }

  async function restartPacket(label: string) {
    const { envelope, store } = await storedEnvelope(label)
    const checkpoint = {
      sequence: envelope.sequence,
      envelopeHash: envelope.envelopeHash,
    }
    const storeResult = await store.loadVerifiedChain(checkpoint)
    expect(storeResult.code).toBe("STORE-VALID-CANDIDATE")
    expect(storeResult.observedHead).toEqual(checkpoint)
    expect(storeResult.candidate?.envelopeId).toBe(envelope.envelopeId)
    expect(storeResult.candidate?.stateSnapshot).toEqual(envelope.stateSnapshot)

    const restart = await preparePersistedRestart(store, {
      restartSessionId: `TEST-RESTART-E2E-CONTINUITY-${counter}`,
      expectedCheckpoint: checkpoint,
      createdAt: "2026-10-10T10:31:00Z",
      allowedRuntimeArtifactRefs: [RUNTIME_BASELINE],
    })
    expect(restart.code).toBe("RESTART-READY-CANDIDATE")
    return {
      envelope,
      store,
      checkpoint,
      packet: restart.packet as RestartCandidatePacket,
    }
  }

  it("E2ER-001..025 asserts one exact provenance/fingerprint equality chain through first new command", async () => {
    const { envelope, checkpoint, packet } = await restartPacket("SUCCESS")

    expect(checkpoint.envelopeHash).toBe(envelope.envelopeHash)
    expect(packet.sourceCheckpoint).toEqual(checkpoint)
    expect(packet.envelopeId).toBe(envelope.envelopeId)
    expect(packet.stateSnapshot).toEqual(envelope.stateSnapshot)

    const target = new SyntheticRestartInstallTarget("TEST-RUNTIME-E2E-CONTINUITY-SUCCESS")
    const beforeInstall = target.snapshot().currentStateFingerprint
    const installed = installRestartCandidate(target, {
      schemaVersion: RESTART_INSTALL_SCHEMA_VERSION,
      operationId: "TEST-INSTALL-OP-E2E-CONTINUITY-SUCCESS",
      authorityRef: "TEST-INSTALL-AUTH-E2E-CONTINUITY",
      authorityStatus: "VALID",
      candidate: packet,
      expectedCurrentStateFingerprint: beforeInstall,
      allowedRuntimeArtifactRefs: [RUNTIME_BASELINE],
      commitOutcome: "COMMIT",
      recordedAt: "2026-10-10T10:32:00Z",
    })

    expect(installed.code).toBe("INSTALL-OK-INSTALLED")
    const installReceipt = installed.receipt!
    const installedFingerprint = installed.target!.currentStateFingerprint

    expect(installReceipt.candidatePacketHash).toBe(packet.packetHash)
    expect(installReceipt.restartSessionId).toBe(packet.restartSessionId)
    expect(installReceipt.envelopeId).toBe(packet.envelopeId)
    expect(installReceipt.sourceCheckpoint).toEqual(checkpoint)
    expect(installReceipt.candidateStateFingerprint).toBe(installedFingerprint)
    expect(installReceipt.installedAfterFingerprint).toBe(installedFingerprint)
    expect(target.snapshot().currentStateFingerprint).toBe(installedFingerprint)

    const opened = SyntheticPostInstallReentrySession.open(target, {
      schemaVersion: POSTINSTALL_REENTRY_SCHEMA_VERSION,
      sessionId: "TEST-REENTRY-SESSION-E2E-CONTINUITY-SUCCESS",
      openedAt: "2026-10-10T10:33:00Z",
    })
    expect(opened.code).toBe("REENTRY-OK-APPLIED")
    expect(opened.session?.openingFingerprint).toBe(installedFingerprint)
    expect(opened.session?.latestFingerprint).toBe(installedFingerprint)
    expect(opened.session?.rootInstallReceipt.operationId).toBe(installReceipt.operationId)
    expect(opened.session?.rootInstallReceipt.candidatePacketHash).toBe(packet.packetHash)
    expect(opened.session?.rootInstallReceipt.sourceCheckpoint).toEqual(checkpoint)

    const handoffId = target.snapshot().currentState.activeHandoffId!
    const first = dispatchPostInstallReentryCommand(opened.sessionHandle!, {
      commandId: "TEST-REENTRY-CMD-E2E-CONTINUITY-FIRST",
      expectedCurrentStateFingerprint: installedFingerprint,
      command: { type: "OBSERVE", handoffId },
      recordedAt: "2026-10-10T10:34:00Z",
    })

    expect(first.code).toBe("REENTRY-OK-APPLIED")
    expect(first.receipt?.beforeFingerprint).toBe(installedFingerprint)
    expect(first.receipt?.rootInstallOperationId).toBe(installReceipt.operationId)
    expect(first.receipt?.rootInstallOperationBodyHash).toBe(installReceipt.operationBodyHash)
    expect(first.receipt?.candidatePacketHash).toBe(packet.packetHash)
    expect(first.receipt?.restartSessionId).toBe(packet.restartSessionId)
    expect(first.receipt?.envelopeId).toBe(envelope.envelopeId)
    expect(first.receipt?.sourceCheckpoint).toEqual(checkpoint)
    expect(first.receipt?.afterFingerprint).toBe(first.target?.currentStateFingerprint)
    expect(first.receipt?.afterFingerprint).toBe(target.snapshot().currentStateFingerprint)
    expect(first.session?.latestFingerprint).toBe(first.receipt?.afterFingerprint)
  })

  it("E2ER-004 refuses advancement without external expectedCheckpoint", async () => {
    const { store } = await storedEnvelope("NO-CHECKPOINT")

    const localOnly = await store.loadVerifiedChain()
    expect(localOnly.code).toBe("STORE-LOCAL-INTEGRITY-ONLY")

    const restart = await preparePersistedRestart(store, {
      restartSessionId: "TEST-RESTART-E2E-CONTINUITY-NO-CHECKPOINT",
      createdAt: "2026-10-10T10:35:00Z",
      allowedRuntimeArtifactRefs: [RUNTIME_BASELINE],
    } as never)
    expect(restart.code).toBe("RESTART-HOLD-CHECKPOINT-REQUIRED")
    expect(restart.effect).toBe("NONE")
    expect(restart.packet).toBeUndefined()
  })

  it("E2ER-011 holds re-entry while install outcome is UNKNOWN", async () => {
    const { packet } = await restartPacket("INSTALL-UNKNOWN")
    const target = new SyntheticRestartInstallTarget("TEST-RUNTIME-E2E-CONTINUITY-INSTALL-UNKNOWN")
    const installed = installRestartCandidate(target, {
      schemaVersion: RESTART_INSTALL_SCHEMA_VERSION,
      operationId: "TEST-INSTALL-OP-E2E-CONTINUITY-UNKNOWN",
      authorityRef: "TEST-INSTALL-AUTH-E2E-CONTINUITY",
      authorityStatus: "VALID",
      candidate: packet,
      expectedCurrentStateFingerprint: target.snapshot().currentStateFingerprint,
      allowedRuntimeArtifactRefs: [RUNTIME_BASELINE],
      commitOutcome: "UNKNOWN",
      recordedAt: "2026-10-10T10:36:00Z",
    })

    expect(installed.code).toBe("INSTALL-HOLD-OPERATION-UNKNOWN")
    const opened = SyntheticPostInstallReentrySession.open(target, {
      sessionId: "TEST-REENTRY-SESSION-E2E-CONTINUITY-INSTALL-UNKNOWN",
      openedAt: "2026-10-10T10:37:00Z",
    })
    expect(opened.code).toBe("REENTRY-HOLD-INSTALL-UNKNOWN")
    expect(opened.effect).toBe("NONE")
    expect(opened.sessionHandle).toBeUndefined()
  })

  it("E2ER-014 refuses stale first-command fingerprint with no target mutation", async () => {
    const { packet } = await restartPacket("STALE-FIRST")
    const target = new SyntheticRestartInstallTarget("TEST-RUNTIME-E2E-CONTINUITY-STALE")
    const installed = installRestartCandidate(target, {
      operationId: "TEST-INSTALL-OP-E2E-CONTINUITY-STALE",
      authorityRef: "TEST-INSTALL-AUTH-E2E-CONTINUITY",
      authorityStatus: "VALID",
      candidate: packet,
      expectedCurrentStateFingerprint: target.snapshot().currentStateFingerprint,
      allowedRuntimeArtifactRefs: [RUNTIME_BASELINE],
      commitOutcome: "COMMIT",
      recordedAt: "2026-10-10T10:38:00Z",
    })
    expect(installed.code).toBe("INSTALL-OK-INSTALLED")

    const opened = SyntheticPostInstallReentrySession.open(target, {
      sessionId: "TEST-REENTRY-SESSION-E2E-CONTINUITY-STALE",
      openedAt: "2026-10-10T10:39:00Z",
    })
    const before = target.snapshot()
    const result = dispatchPostInstallReentryCommand(opened.sessionHandle!, {
      commandId: "TEST-REENTRY-CMD-E2E-CONTINUITY-STALE",
      expectedCurrentStateFingerprint: "a".repeat(64),
      command: {
        type: "OBSERVE",
        handoffId: before.currentState.activeHandoffId!,
      },
      recordedAt: "2026-10-10T10:40:00Z",
    })

    expect(result.code).toBe("REENTRY-CONFLICT-CURRENT-STATE")
    expect(result.effect).toBe("NONE")
    expect(target.snapshot()).toEqual(before)
  })

  it("E2ER-019 refuses historical replay metadata before ordinary dispatch", async () => {
    const { packet } = await restartPacket("NO-REPLAY")
    const target = new SyntheticRestartInstallTarget("TEST-RUNTIME-E2E-CONTINUITY-NO-REPLAY")
    const installed = installRestartCandidate(target, {
      operationId: "TEST-INSTALL-OP-E2E-CONTINUITY-NO-REPLAY",
      authorityRef: "TEST-INSTALL-AUTH-E2E-CONTINUITY",
      authorityStatus: "VALID",
      candidate: packet,
      expectedCurrentStateFingerprint: target.snapshot().currentStateFingerprint,
      allowedRuntimeArtifactRefs: [RUNTIME_BASELINE],
      commitOutcome: "COMMIT",
      recordedAt: "2026-10-10T10:41:00Z",
    })
    expect(installed.code).toBe("INSTALL-OK-INSTALLED")

    const opened = SyntheticPostInstallReentrySession.open(target, {
      sessionId: "TEST-REENTRY-SESSION-E2E-CONTINUITY-NO-REPLAY",
      openedAt: "2026-10-10T10:42:00Z",
    })
    const before = target.snapshot()
    const replay = dispatchPostInstallReentryCommand(opened.sessionHandle!, {
      commandId: "TEST-REENTRY-CMD-E2E-CONTINUITY-NO-REPLAY",
      expectedCurrentStateFingerprint: before.currentStateFingerprint,
      command: {
        type: "OBSERVE",
        handoffId: before.currentState.activeHandoffId!,
      },
      recordedAt: "2026-10-10T10:43:00Z",
      replayHistory: true,
    } as never)

    expect(replay.code).toBe("REENTRY-REFUSE-HISTORICAL-REPLAY")
    expect(replay.effect).toBe("NONE")
    expect(target.snapshot()).toEqual(before)
  })
})
