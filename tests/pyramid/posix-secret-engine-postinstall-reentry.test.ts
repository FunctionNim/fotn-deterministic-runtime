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
import * as installGateModule from "../../src/pyramid/posix-secret-engine-restart-install-gate.js"
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

  function openSession(
    target: SyntheticRestartInstallTarget,
    suffix: string,
  ) {
    return SyntheticPostInstallReentrySession.open(target, {
      schemaVersion: POSTINSTALL_REENTRY_SCHEMA_VERSION,
      sessionId: `TEST-REENTRY-SESSION-${suffix}`,
      openedAt: "2026-10-10T10:13:00Z",
    })
  }

  it("RER-004..010 opens only from committed promoted install root and performs no command", async () => {
    const candidate = await promotedCandidate({ label: "OPEN" })
    const target = await installedTarget(candidate)
    const before = target.snapshot()
    const opened = openSession(target, "OPEN")

    expect(opened.code).toBe("REENTRY-OK-APPLIED")
    expect(opened.effect).toBe("NONE")
    expect(opened.sessionHandle).toBeInstanceOf(SyntheticPostInstallReentrySession)
    expect(opened.session?.openingFingerprint).toBe(before.currentStateFingerprint)
    expect(opened.session?.rootInstallReceipt.decision).toBe("COMMITTED")
    expect(opened.session?.continuationReceipts).toHaveLength(0)
    expect(target.snapshot()).toEqual(before)
  })

  it("RC-RE08 exposes no standalone target mutation bridge", () => {
    expect(
      "__dispatchSyntheticRestartTargetCommandForReentry" in installGateModule,
    ).toBe(false)
  })

  it("RC-RE06 fresh promoted target cannot mutate without committed install root and session", () => {
    const target = new SyntheticRestartInstallTarget("TEST-RUNTIME-REENTRY-FRESH-NO-INSTALL")
    const before = target.snapshot()

    const opened = openSession(target, "FRESH-NO-INSTALL")
    expect(opened.code).toBe("REENTRY-HOLD-INSTALL-ROOT")
    expect(opened.effect).toBe("NONE")
    expect(opened.sessionHandle).toBeUndefined()
    expect(target.snapshot()).toEqual(before)
  })

  it("RER-004 rejects forged detached target identity", async () => {
    const candidate = await promotedCandidate({ label: "FORGED-TARGET" })
    const target = await installedTarget(candidate, "TEST-RUNTIME-REENTRY-FORGED")
    const forged = { snapshot: () => target.snapshot() } as unknown as SyntheticRestartInstallTarget

    const opened = openSession(forged, "FORGED")
    expect(opened.code).toBe("REENTRY-INVALID-TARGET")
    expect(opened.effect).toBe("NONE")
  })

  it("RER-007 holds opening while latest install outcome is UNKNOWN", async () => {
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
    expect(openSession(target, "INSTALL-UNKNOWN").code).toBe("REENTRY-HOLD-INSTALL-UNKNOWN")
  })

  it("RER-014..020 dispatches exact ordinary functions and chains immutable receipts", async () => {
    const candidate = await promotedCandidate({ label: "CHAIN" })
    const target = await installedTarget(candidate, "TEST-RUNTIME-REENTRY-CHAIN")
    const opened = openSession(target, "CHAIN")
    const session = opened.sessionHandle!
    const handoffId = target.snapshot().currentState.activeHandoffId!
    const fingerprint = target.snapshot().currentStateFingerprint

    const first = dispatchPostInstallReentryCommand(session, {
      commandId: "TEST-REENTRY-CMD-CHAIN-1",
      expectedCurrentStateFingerprint: fingerprint,
      command: { type: "OBSERVE", handoffId },
      recordedAt: "2026-10-10T10:14:00Z",
    })
    expect(first.code).toBe("REENTRY-OK-APPLIED")
    expect(first.receipt?.machineCode).toBe("OK-DUPLICATE")
    expect(first.effect).toBe("NONE")
    expect(Object.isFrozen(first.receipt)).toBe(true)

    const second = dispatchPostInstallReentryCommand(session, {
      commandId: "TEST-REENTRY-CMD-CHAIN-2",
      expectedCurrentStateFingerprint: first.target!.currentStateFingerprint,
      command: { type: "VALIDATE", handoffId },
      recordedAt: "2026-10-10T10:14:01Z",
    })
    expect(second.code).toBe("REENTRY-OK-APPLIED")
    expect(second.receipt?.machineCode).toBe("INVALID-FINGERPRINT")
    expect(second.target?.currentState.state).toBe("HOLD")
    expect(second.receipt?.parentReceiptHash).toBe(first.receipt?.receiptHash)
    expect(second.session?.continuationReceipts).toHaveLength(2)
    expect(second.receipt?.rootInstallOperationId).toBe(
      opened.session?.rootInstallReceipt.operationId,
    )
    expect(second.receipt?.candidatePacketHash).toBe(
      opened.session?.rootInstallReceipt.candidatePacketHash,
    )
    expect(target.snapshot().currentStateFingerprint).toBe(
      second.receipt?.afterFingerprint,
    )

    const { receiptHash, ...body } = second.receipt!
    expect(postInstallReentryReceiptHash(body)).toBe(receiptHash)
  })

  it("RER-021/022 exact duplicate is idempotent and changed body conflicts", async () => {
    const candidate = await promotedCandidate({ label: "IDEMPOTENT" })
    const target = await installedTarget(candidate, "TEST-RUNTIME-REENTRY-IDEMPOTENT")
    const opened = openSession(target, "IDEMPOTENT")
    const session = opened.sessionHandle!
    const handoffId = target.snapshot().currentState.activeHandoffId!
    const fp = target.snapshot().currentStateFingerprint
    const input = {
      commandId: "TEST-REENTRY-CMD-IDEMPOTENT",
      expectedCurrentStateFingerprint: fp,
      command: { type: "OBSERVE" as const, handoffId },
      recordedAt: "2026-10-10T10:15:00Z",
    }

    const first = dispatchPostInstallReentryCommand(session, input)
    const duplicate = dispatchPostInstallReentryCommand(session, input)
    expect(first.code).toBe("REENTRY-OK-APPLIED")
    expect(duplicate.code).toBe("REENTRY-OK-ALREADY-APPLIED")
    expect(duplicate.effect).toBe("NONE")
    expect(duplicate.receipt).toEqual(first.receipt)

    const conflict = dispatchPostInstallReentryCommand(session, {
      ...input,
      command: { type: "VALIDATE", handoffId },
    })
    expect(conflict.code).toBe("REENTRY-CONFLICT-COMMAND")
  })

  it("RER-016 preserves installed UNKNOWN_OUTCOME until explicit reconcile command", async () => {
    const operationId = "TEST-OP-REENTRY-CANDIDATE-UNKNOWN"
    const candidate = await promotedCandidate({
      label: "CANDIDATE-UNKNOWN",
      commands: commandsForUnknown(operationId),
    })
    expect(candidate.stateSnapshot.state).toBe("UNKNOWN_OUTCOME")
    const target = await installedTarget(candidate, "TEST-RUNTIME-REENTRY-CANDIDATE-UNKNOWN")
    const opened = openSession(target, "CANDIDATE-UNKNOWN")
    const session = opened.sessionHandle!
    expect(target.snapshot().currentState.state).toBe("UNKNOWN_OUTCOME")

    const result = dispatchPostInstallReentryCommand(session, {
      commandId: "TEST-REENTRY-CMD-RECONCILE-UNKNOWN",
      expectedCurrentStateFingerprint: target.snapshot().currentStateFingerprint,
      command: {
        type: "RECONCILE",
        operationId,
        authoritativeDecision: "COMMITTED",
      },
      recordedAt: "2026-10-10T10:16:00Z",
    })

    expect(result.code).toBe("REENTRY-OK-APPLIED")
    expect(result.receipt?.machineCode).toBe("OK-ALREADY-COMMITTED")
    expect(result.target?.currentState.state).toBe("ADMITTED")
    expect(
      result.target?.currentState.admissionReceipts[operationId].decision,
    ).toBe("COMMITTED")
  })

  it("RER-009 rejects stale expected current-state fingerprint before dispatch", async () => {
    const candidate = await promotedCandidate({ label: "STALE-FP" })
    const target = await installedTarget(candidate, "TEST-RUNTIME-REENTRY-STALE-FP")
    const session = openSession(target, "STALE-FP").sessionHandle!
    const handoffId = target.snapshot().currentState.activeHandoffId!

    const result = dispatchPostInstallReentryCommand(session, {
      commandId: "TEST-REENTRY-CMD-STALE-FP",
      expectedCurrentStateFingerprint: "a".repeat(64),
      command: { type: "OBSERVE", handoffId },
      recordedAt: "2026-10-10T10:17:00Z",
    })
    expect(result.code).toBe("REENTRY-CONFLICT-CURRENT-STATE")
    expect(result.effect).toBe("NONE")
  })

  it("RER-024/025 makes old session stale after later committed install changes target", async () => {
    const firstCandidate = await promotedCandidate({ label: "STALE-SESSION-A" })
    const target = await installedTarget(firstCandidate, "TEST-RUNTIME-REENTRY-STALE-SESSION")
    const session = openSession(target, "STALE-SESSION").sessionHandle!

    const unknownOperation = "TEST-OP-REENTRY-STALE-SESSION-UNKNOWN"
    const secondCandidate = await promotedCandidate({
      label: "STALE-SESSION-B",
      commands: commandsForUnknown(unknownOperation),
    })
    const install = installRestartCandidate(target, {
      schemaVersion: RESTART_INSTALL_SCHEMA_VERSION,
      operationId: "TEST-INSTALL-OP-REENTRY-REPLACE",
      authorityRef: "TEST-INSTALL-AUTH-REENTRY",
      authorityStatus: "VALID",
      candidate: secondCandidate,
      expectedCurrentStateFingerprint: target.snapshot().currentStateFingerprint,
      allowedRuntimeArtifactRefs: [RUNTIME_BASELINE],
      commitOutcome: "COMMIT",
      recordedAt: "2026-10-10T10:17:30Z",
    })
    expect(install.code).toBe("INSTALL-OK-INSTALLED")

    const handoffId = target.snapshot().currentState.activeHandoffId!
    const result = dispatchPostInstallReentryCommand(session, {
      commandId: "TEST-REENTRY-CMD-STALE-SESSION",
      expectedCurrentStateFingerprint: target.snapshot().currentStateFingerprint,
      command: { type: "OBSERVE", handoffId },
      recordedAt: "2026-10-10T10:18:00Z",
    })
    expect(result.code).toBe("REENTRY-CONFLICT-SESSION-STALE")
    expect(result.effect).toBe("NONE")
  })

  it("RER-011/013 refuses installPacket and historical replay attempts", async () => {
    const candidate = await promotedCandidate({ label: "REFUSE-REPLAY" })
    const target = await installedTarget(candidate, "TEST-RUNTIME-REENTRY-REFUSE")
    const session = openSession(target, "REFUSE").sessionHandle!
    const fp = target.snapshot().currentStateFingerprint

    const forbidden = dispatchPostInstallReentryCommand(session, {
      commandId: "TEST-REENTRY-CMD-INSTALL-PACKET",
      expectedCurrentStateFingerprint: fp,
      command: { type: "INSTALL_PACKET" } as never,
      recordedAt: "2026-10-10T10:19:00Z",
    })
    expect(forbidden.code).toBe("REENTRY-REFUSE-COMMAND")

    const replay = dispatchPostInstallReentryCommand(session, {
      commandId: "TEST-REENTRY-CMD-REPLAY",
      expectedCurrentStateFingerprint: fp,
      command: {
        type: "OBSERVE",
        handoffId: target.snapshot().currentState.activeHandoffId!,
      },
      recordedAt: "2026-10-10T10:19:01Z",
      replayHistory: true,
    } as never)
    expect(replay.code).toBe("REENTRY-REFUSE-HISTORICAL-REPLAY")
  })

  it.each([
    ["append", true, "REENTRY-REFUSE-STORE-MUTATION"],
    ["sourceMutation", "WRITE", "REENTRY-REFUSE-SOURCE-MUTATION"],
    ["autoProcess", true, "REENTRY-REFUSE-AUTO-PROCESS"],
    ["network", true, "REENTRY-REFUSE-AUTO-PROCESS"],
    ["database", true, "REENTRY-REFUSE-AUTO-PROCESS"],
    ["cloud", true, "REENTRY-REFUSE-AUTO-PROCESS"],
  ])("RER-027..030 refuses forbidden field %s", async (key, value, expected) => {
    const candidate = await promotedCandidate({ label: `FORBIDDEN-${key}` })
    const target = await installedTarget(candidate, `TEST-RUNTIME-REENTRY-${key}`)
    const session = openSession(target, `FORBIDDEN-${key}`).sessionHandle!
    const result = dispatchPostInstallReentryCommand(session, {
      commandId: `TEST-REENTRY-CMD-FORBIDDEN-${key}`,
      expectedCurrentStateFingerprint: target.snapshot().currentStateFingerprint,
      command: {
        type: "OBSERVE",
        handoffId: target.snapshot().currentState.activeHandoffId!,
      },
      recordedAt: "2026-10-10T10:20:00Z",
      [key]: value,
    } as never)
    expect(result.code).toBe(expected)
    expect(result.effect).toBe("NONE")
  })

  it("RER-012 rejects malformed command input without invoking interface functions", async () => {
    const candidate = await promotedCandidate({ label: "MALFORMED" })
    const target = await installedTarget(candidate, "TEST-RUNTIME-REENTRY-MALFORMED")
    const session = openSession(target, "MALFORMED").sessionHandle!
    const before = target.snapshot()

    const result = dispatchPostInstallReentryCommand(session, {
      commandId: "TEST-REENTRY-CMD-MALFORMED",
      expectedCurrentStateFingerprint: before.currentStateFingerprint,
      command: { type: "OBSERVE" } as never,
      recordedAt: "2026-10-10T10:21:00Z",
    })
    expect(result.code).toBe("REENTRY-INVALID-COMMAND")
    expect(target.snapshot()).toEqual(before)
  })
})
