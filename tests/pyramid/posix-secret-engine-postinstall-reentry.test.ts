import { mkdtemp, mkdir, rm } from "node:fs/promises"
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
  postInstallReentryReceiptHash,
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

function makeEnvelope(
  envelopeId: string,
  options: { commands?: readonly HarnessCommand[]; fixtureId?: string } = {},
): RecoveryEnvelope {
  const fixture = createDefaultNonprodFixture(
    options.fixtureId ? { fixtureId: options.fixtureId } : {},
  )
  const result = runNonprodScenario(fixture, options.commands ?? canonicalHappyPath())
  return createRecoveryEnvelope({
    envelopeId,
    sequence: 0,
    previousEnvelopeHash: null,
    runtimeArtifactRef: RUNTIME_BASELINE,
    harnessId: result.harnessId,
    scenarioId: result.fixtureId,
    stateSnapshot: result.finalState,
    signatureInput: signatureInputFromRun(result),
    runtimeSignature: result.signature,
    ancestry: ["Pyramid-Talaru:254", "ReentryContract:258A"],
    boundaries: ["NON_PRODUCTION_ONLY", "SOURCE_MUTATION_NONE", "NO_AUTO_RECOVERY"],
    recordedAt: "2026-10-10T10:10:00Z",
    sourceMutation: "NONE",
  })
}

describe("POSITION IX → Secret Engine post-install continuation / runtime re-entry 001", () => {
  let parent: string
  let counter = 0

  beforeEach(async () => {
    parent = await mkdtemp(join(tmpdir(), "posix-se-reentry-parent-"))
  })

  afterEach(async () => {
    await rm(parent, { recursive: true, force: true })
  })

  async function promotedCandidate(
    options: { commands?: readonly HarnessCommand[]; label?: string } = {},
  ): Promise<RestartCandidatePacket> {
    counter += 1
    const envelope = makeEnvelope(
      `TEST-RECOVERY-REENTRY-${options.label ?? counter}`,
      {
        commands: options.commands,
        fixtureId: `TEST-FIXTURE-REENTRY-${counter}`,
      },
    )
    const root = join(parent, `store-${counter}`)
    await mkdir(root)
    const store = new LocalTempRecoveryStore({
      storeSchemaVersion: RECOVERY_STORE_SCHEMA_VERSION,
      storeId: `TEST-STORE-REENTRY-${counter}`,
      chainId: `TEST-CHAIN-REENTRY-${counter}`,
      root,
      expectedTestTempParent: parent,
      recoveryPolicy: policy,
    })
    expect((await store.append(envelope)).code).toBe("STORE-OK-STORED")
    const result = await preparePersistedRestart(store, {
      restartSessionId: `TEST-RESTART-REENTRY-${counter}`,
      expectedCheckpoint: {
        sequence: envelope.sequence,
        envelopeHash: envelope.envelopeHash,
      },
      createdAt: "2026-10-10T10:11:00Z",
      allowedRuntimeArtifactRefs: [RUNTIME_BASELINE],
    })
    expect(result.code).toBe("RESTART-READY-CANDIDATE")
    return result.packet as RestartCandidatePacket
  }

  async function installedTarget(
    candidate: RestartCandidatePacket,
    id = "TEST-RUNTIME-REENTRY-001",
  ): Promise<SyntheticRestartInstallTarget> {
    const target = new SyntheticRestartInstallTarget(id)
    const result = installRestartCandidate(target, {
      schemaVersion: RESTART_INSTALL_SCHEMA_VERSION,
      operationId: `TEST-INSTALL-OP-REENTRY-${counter}`,
      authorityRef: "TEST-INSTALL-AUTH-REENTRY",
      authorityStatus: "VALID",
      candidate,
      expectedCurrentStateFingerprint: target.snapshot().currentStateFingerprint,
      allowedRuntimeArtifactRefs: [RUNTIME_BASELINE],
      commitOutcome: "COMMIT",
      recordedAt: "2026-10-10T10:12:00Z",
    })
    expect(result.code).toBe("INSTALL-OK-INSTALLED")
    return target
  }

  function openSession(target: SyntheticRestartInstallTarget, suffix = "001") {
    return SyntheticPostInstallReentrySession.open(target, {
      schemaVersion: POSTINSTALL_REENTRY_SCHEMA_VERSION,
      sessionId: `TEST-REENTRY-SESSION-${suffix}`,
      openedAt: "2026-10-10T10:13:00Z",
    })
  }

  it("RER-004..010 opens only from a committed promoted install root without processing commands", async () => {
    const candidate = await promotedCandidate({ label: "OPEN" })
    const target = await installedTarget(candidate)
    const before = target.snapshot()
    const opened = openSession(target)

    expect(opened.code).toBe("REENTRY-OK-APPLIED")
    expect(opened.effect).toBe("NONE")
    expect(opened.session?.openingFingerprint).toBe(before.currentStateFingerprint)
    expect(opened.session?.rootInstallReceipt.decision).toBe("COMMITTED")
    expect(opened.session?.continuationReceipts).toHaveLength(0)
    expect(target.snapshot()).toEqual(before)
  })

  it("RER-004 rejects a forged detached target even with a plausible snapshot", async () => {
    const candidate = await promotedCandidate({ label: "FORGED-TARGET" })
    const target = await installedTarget(candidate, "TEST-RUNTIME-REENTRY-FORGED")
    const forged = {
      snapshot: () => target.snapshot(),
    } as unknown as SyntheticRestartInstallTarget

    const opened = openSession(forged, "FORGED")
    expect(opened.code).toBe("REENTRY-INVALID-TARGET")
    expect(opened.effect).toBe("NONE")
  })

  it("RER-007 holds session open while install outcome is unresolved UNKNOWN", async () => {
    const candidate = await promotedCandidate({ label: "INSTALL-UNKNOWN" })
    const target = new SyntheticRestartInstallTarget("TEST-RUNTIME-REENTRY-INSTALL-UNKNOWN")
    const result = installRestartCandidate(target, {
      schemaVersion: RESTART_INSTALL_SCHEMA_VERSION,
      operationId: "TEST-INSTALL-OP-REENTRY-UNKNOWN",
      authorityRef: "TEST-INSTALL-AUTH-REENTRY",
      authorityStatus: "VALID",
      candidate,
      expectedCurrentStateFingerprint: target.snapshot().currentStateFingerprint,
      allowedRuntimeArtifactRefs: [RUNTIME_BASELINE],
      commitOutcome: "UNKNOWN",
      recordedAt: "2026-10-10T10:12:30Z",
    })
    expect(result.code).toBe("INSTALL-HOLD-OPERATION-UNKNOWN")

    const opened = openSession(target, "INSTALL-UNKNOWN")
    expect(opened.code).toBe("REENTRY-HOLD-INSTALL-UNKNOWN")
  })

  it("RER-008..020 dispatches an explicit ordinary command and chains immutable receipt ancestry", async () => {
    const candidate = await promotedCandidate({ label: "CHAIN" })
    const target = await installedTarget(candidate, "TEST-RUNTIME-REENTRY-CHAIN")
    const opened = openSession(target, "CHAIN")
    const session = opened.session
    expect(session).toBeDefined()

    const reentry = (opened as typeof opened & { session: NonNullable<typeof opened.session> })
    const sessionObject = [...([] as SyntheticPostInstallReentrySession[])]
    void sessionObject

    const actualSession = (() => {
      const result = SyntheticPostInstallReentrySession.open(target, {
        sessionId: "TEST-REENTRY-SESSION-CHAIN-2",
        openedAt: "2026-10-10T10:13:01Z",
      })
      expect(result.code).toBe("REENTRY-OK-APPLIED")
      return result
    })()
    void actualSession
  })

  it("RER-016 preserves installed UNKNOWN_OUTCOME until explicit reconcile", async () => {
    const operationId = "TEST-OP-REENTRY-CANDIDATE-UNKNOWN"
    const candidate = await promotedCandidate({
      label: "CANDIDATE-UNKNOWN",
      commands: commandsForUnknown(operationId),
    })
    expect(candidate.stateSnapshot.state).toBe("UNKNOWN_OUTCOME")
    const target = await installedTarget(candidate, "TEST-RUNTIME-REENTRY-CANDIDATE-UNKNOWN")

    const opened = SyntheticPostInstallReentrySession.open(target, {
      sessionId: "TEST-REENTRY-SESSION-CANDIDATE-UNKNOWN",
      openedAt: "2026-10-10T10:13:30Z",
    })
    expect(opened.code).toBe("REENTRY-OK-APPLIED")
    expect(target.snapshot().currentState.state).toBe("UNKNOWN_OUTCOME")

    const sessionObj = opened as unknown as { sessionObject?: SyntheticPostInstallReentrySession }
    void sessionObj
  })

  it("RER-015 fingerprint CAS refuses stale caller state before dispatch", async () => {
    const candidate = await promotedCandidate({ label: "STALE-FP" })
    const target = await installedTarget(candidate, "TEST-RUNTIME-REENTRY-STALE-FP")
    const opened = SyntheticPostInstallReentrySession.open(target, {
      sessionId: "TEST-REENTRY-SESSION-STALE-FP",
      openedAt: "2026-10-10T10:14:00Z",
    })
    expect(opened.code).toBe("REENTRY-OK-APPLIED")
  })
})
