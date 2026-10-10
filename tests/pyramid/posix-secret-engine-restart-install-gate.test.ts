import { mkdtemp, mkdir, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import {
  createInterfaceState,
  type InterfaceRuntimeState,
} from "../../src/pyramid/posix-secret-engine-interface.js"
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
  reconcileRestartInstall,
  restartInstallStateFingerprint,
} from "../../src/pyramid/posix-secret-engine-restart-install-gate.js"

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
  options: {
    commands?: readonly HarnessCommand[]
    fixtureId?: string
  } = {},
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
    ancestry: ["Pyramid-Talaru:238", "InstallGateContract:242A"],
    boundaries: ["NON_PRODUCTION_ONLY", "SOURCE_MUTATION_NONE", "NO_AUTO_RECOVERY"],
    recordedAt: "2026-10-10T09:30:00Z",
    sourceMutation: "NONE",
  })
}

describe("POSITION IX → Secret Engine restart candidate installation gate 001", () => {
  let parent: string
  let root: string
  let store: LocalTempRecoveryStore
  let counter = 0

  beforeEach(async () => {
    parent = await mkdtemp(join(tmpdir(), "posix-se-install-parent-"))
    root = join(parent, "store")
    await mkdir(root)
    store = new LocalTempRecoveryStore({
      storeSchemaVersion: RECOVERY_STORE_SCHEMA_VERSION,
      storeId: "TEST-STORE-INSTALL-001",
      chainId: "TEST-CHAIN-INSTALL-001",
      root,
      expectedTestTempParent: parent,
      recoveryPolicy: policy,
    })
  })

  afterEach(async () => {
    await rm(parent, { recursive: true, force: true })
  })

  async function promotedCandidate(
    options: {
      commands?: readonly HarnessCommand[]
      label?: string
    } = {},
  ): Promise<RestartCandidatePacket> {
    counter += 1
    const envelope = makeEnvelope(
      `TEST-RECOVERY-INSTALL-${options.label ?? counter}`,
      {
        commands: options.commands,
        fixtureId: `TEST-FIXTURE-INSTALL-${counter}`,
      },
    )
    const candidateRoot = join(parent, `store-${counter}`)
    await mkdir(candidateRoot)
    const candidateStore = new LocalTempRecoveryStore({
      storeSchemaVersion: RECOVERY_STORE_SCHEMA_VERSION,
      storeId: `TEST-STORE-INSTALL-${counter}`,
      chainId: `TEST-CHAIN-INSTALL-${counter}`,
      root: candidateRoot,
      expectedTestTempParent: parent,
      recoveryPolicy: policy,
    })
    const append = await candidateStore.append(envelope)
    expect(append.code).toBe("STORE-OK-STORED")
    const result = await preparePersistedRestart(candidateStore, {
      restartSessionId: `TEST-RESTART-INSTALL-${counter}`,
      expectedCheckpoint: {
        sequence: envelope.sequence,
        envelopeHash: envelope.envelopeHash,
      },
      createdAt: "2026-10-10T09:31:00Z",
      allowedRuntimeArtifactRefs: [RUNTIME_BASELINE],
    })
    expect(result.code).toBe("RESTART-READY-CANDIDATE")
    return result.packet as RestartCandidatePacket
  }

  function freshTarget(id = "TEST-RUNTIME-001") {
    return new SyntheticRestartInstallTarget(id)
  }

  function installInput(
    target: SyntheticRestartInstallTarget,
    candidate: RestartCandidatePacket,
    overrides: Record<string, unknown> = {},
  ) {
    return {
      schemaVersion: RESTART_INSTALL_SCHEMA_VERSION,
      operationId: "TEST-INSTALL-OP-001",
      authorityRef: "TEST-INSTALL-AUTH-VALID",
      authorityStatus: "VALID",
      candidate,
      expectedCurrentStateFingerprint: target.snapshot().currentStateFingerprint,
      allowedRuntimeArtifactRefs: [RUNTIME_BASELINE],
      commitOutcome: "COMMIT",
      recordedAt: "2026-10-10T09:32:00Z",
      ...overrides,
    }
  }

  it("IGR-006/017 installs only a genuinely promoted candidate into a fresh synthetic target", async () => {
    const candidate = await promotedCandidate({ label: "HAPPY" })
    const target = freshTarget()
    const result = installRestartCandidate(target, installInput(target, candidate))

    expect(result.code).toBe("INSTALL-OK-INSTALLED")
    expect(result.effect).toBe("ENGINE_LOCAL")
    expect(result.target?.currentState).toEqual(candidate.stateSnapshot)
    expect(result.target?.currentStateFingerprint).toBe(
      restartInstallStateFingerprint(candidate.stateSnapshot),
    )
    expect(result.receipt?.decision).toBe("COMMITTED")
    expect(Object.isFrozen(result.receipt)).toBe(true)
    expect(result.receipt?.candidatePacketHash).toBe(candidate.packetHash)
    expect(result.receipt?.restartSessionId).toBe(candidate.restartSessionId)
    expect(result.receipt?.sourceCheckpoint).toEqual(candidate.sourceCheckpoint)
  })

  it("IGR-006 rejects a self-consistent clone that lacks promoted provenance", async () => {
    const candidate = await promotedCandidate({ label: "FORGED" })
    const forged = structuredClone(candidate)
    const target = freshTarget()

    const result = installRestartCandidate(
      target,
      installInput(target, forged as RestartCandidatePacket),
    )

    expect(result.code).toBe("INSTALL-INVALID-CANDIDATE")
    expect(result.effect).toBe("NONE")
    expect(target.snapshot().currentState).toEqual(createInterfaceState())
  })

  it("IGR-012 refuses stale expected current-state fingerprint", async () => {
    const candidate = await promotedCandidate({ label: "STALE" })
    const target = freshTarget()
    const result = installRestartCandidate(target, installInput(target, candidate, {
      expectedCurrentStateFingerprint: "a".repeat(64),
    }))

    expect(result.code).toBe("INSTALL-CONFLICT-CURRENT-STATE")
    expect(result.effect).toBe("NONE")
  })

  it("IGR-013 refuses first install over a non-fresh progressed target", async () => {
    const candidate = await promotedCandidate({ label: "NONFRESH-CANDIDATE" })
    const progressed: InterfaceRuntimeState = structuredClone(candidate.stateSnapshot)
    const target = new SyntheticRestartInstallTarget("TEST-RUNTIME-NONFRESH", progressed)

    const result = installRestartCandidate(target, installInput(target, candidate, {
      operationId: "TEST-INSTALL-OP-NONFRESH",
    }))

    expect(result.code).toBe("INSTALL-REFUSE-NONFRESH-TARGET")
    expect(result.effect).toBe("NONE")
    expect(target.snapshot().currentState).toEqual(progressed)
  })

  it("IGR-015 exact committed duplicate is idempotent with effect NONE", async () => {
    const candidate = await promotedCandidate({ label: "DUP" })
    const target = freshTarget()
    const input = installInput(target, candidate)
    const first = installRestartCandidate(target, input)
    const second = installRestartCandidate(target, input)

    expect(first.code).toBe("INSTALL-OK-INSTALLED")
    expect(second.code).toBe("INSTALL-OK-ALREADY-INSTALLED")
    expect(second.effect).toBe("NONE")
    expect(second.receipt).toEqual(first.receipt)
    expect(target.snapshot().installReceipts).toHaveLength(1)
  })

  it("IGR-014 same operationId with changed semantic body conflicts", async () => {
    const candidate = await promotedCandidate({ label: "OP-CONFLICT" })
    const target = freshTarget()
    const input = installInput(target, candidate)
    expect(installRestartCandidate(target, input).code).toBe("INSTALL-OK-INSTALLED")

    const changed = installRestartCandidate(target, {
      ...input,
      authorityRef: "TEST-INSTALL-AUTH-OTHER",
    })

    expect(changed.code).toBe("INSTALL-CONFLICT-OPERATION")
    expect(changed.effect).toBe("NONE")
  })

  it("IGR-019 UNKNOWN outcome writes immutable receipt, leaves state fresh, and blocks blind retry", async () => {
    const candidate = await promotedCandidate({ label: "UNKNOWN-OUTCOME" })
    const target = freshTarget()
    const before = target.snapshot()
    const input = installInput(target, candidate, {
      operationId: "TEST-INSTALL-OP-UNKNOWN",
      commitOutcome: "UNKNOWN",
    })

    const first = installRestartCandidate(target, input)
    const retry = installRestartCandidate(target, input)

    expect(first.code).toBe("INSTALL-HOLD-OPERATION-UNKNOWN")
    expect(first.effect).toBe("NONE")
    expect(first.receipt?.decision).toBe("UNKNOWN")
    expect(Object.isFrozen(first.receipt)).toBe(true)
    expect(target.snapshot().currentState).toEqual(before.currentState)
    expect(retry.code).toBe("INSTALL-HOLD-OPERATION-UNKNOWN")
    expect(retry.effect).toBe("NONE")
  })


  it("RC-IG06 fences the whole target while any latest install outcome is UNKNOWN", async () => {
    const candidateA = await promotedCandidate({ label: "TARGET-FENCE-A" })
    const candidateB = await promotedCandidate({ label: "TARGET-FENCE-B" })
    const target = freshTarget("TEST-RUNTIME-TARGET-FENCE")
    const before = target.snapshot()

    const opA = installRestartCandidate(target, installInput(target, candidateA, {
      operationId: "TEST-INSTALL-OP-TARGET-FENCE-A",
      commitOutcome: "UNKNOWN",
    }))
    expect(opA.code).toBe("INSTALL-HOLD-OPERATION-UNKNOWN")
    expect(opA.effect).toBe("NONE")
    expect(target.snapshot().installReceipts).toHaveLength(1)

    const opBInput = installInput(target, candidateB, {
      operationId: "TEST-INSTALL-OP-TARGET-FENCE-B",
      commitOutcome: "COMMIT",
    })
    const blockedB = installRestartCandidate(target, opBInput)

    expect(blockedB.code).toBe("INSTALL-HOLD-OPERATION-UNKNOWN")
    expect(blockedB.effect).toBe("NONE")
    expect(blockedB.receipt?.operationId).toBe("TEST-INSTALL-OP-TARGET-FENCE-A")
    expect(target.snapshot().currentState).toEqual(before.currentState)
    expect(target.snapshot().installReceipts).toHaveLength(1)

    const reconciledA = reconcileRestartInstall(target, {
      operationId: "TEST-INSTALL-OP-TARGET-FENCE-A",
      authoritativeDecision: "NOT_COMMITTED",
      recordedAt: "2026-10-10T09:33:30Z",
    })
    expect(reconciledA.code).toBe("INSTALL-OK-RECONCILED-NOT-COMMITTED")
    expect(reconciledA.effect).toBe("NONE")
    expect(target.snapshot().installReceipts).toHaveLength(2)

    const allowedB = installRestartCandidate(target, opBInput)
    expect(allowedB.code).toBe("INSTALL-OK-INSTALLED")
    expect(allowedB.effect).toBe("ENGINE_LOCAL")
    expect(allowedB.target?.currentState).toEqual(candidateB.stateSnapshot)
    expect(target.snapshot().installReceipts).toHaveLength(3)
  })

  it("RC-IG05 latest reconciled decision clears historical UNKNOWN from the target fence", async () => {
    const candidateA = await promotedCandidate({ label: "LATEST-DECISION-A" })
    const candidateB = await promotedCandidate({ label: "LATEST-DECISION-B" })
    const target = freshTarget("TEST-RUNTIME-LATEST-DECISION")

    installRestartCandidate(target, installInput(target, candidateA, {
      operationId: "TEST-INSTALL-OP-LATEST-DECISION-A",
      commitOutcome: "UNKNOWN",
    }))
    expect(reconcileRestartInstall(target, {
      operationId: "TEST-INSTALL-OP-LATEST-DECISION-A",
      authoritativeDecision: "NOT_COMMITTED",
      recordedAt: "2026-10-10T09:33:45Z",
    }).code).toBe("INSTALL-OK-RECONCILED-NOT-COMMITTED")

    const result = installRestartCandidate(target, installInput(target, candidateB, {
      operationId: "TEST-INSTALL-OP-LATEST-DECISION-B",
      commitOutcome: "COMMIT",
    }))
    expect(result.code).toBe("INSTALL-OK-INSTALLED")
    expect(result.effect).toBe("ENGINE_LOCAL")
  })

  it("IGR-024 explicitly reconciles UNKNOWN to COMMITTED only while original expected state still holds", async () => {
    const candidate = await promotedCandidate({ label: "RECONCILE-COMMIT" })
    const target = freshTarget()
    const input = installInput(target, candidate, {
      operationId: "TEST-INSTALL-OP-RECONCILE-COMMIT",
      commitOutcome: "UNKNOWN",
    })
    expect(installRestartCandidate(target, input).code).toBe("INSTALL-HOLD-OPERATION-UNKNOWN")

    const reconciled = reconcileRestartInstall(target, {
      operationId: "TEST-INSTALL-OP-RECONCILE-COMMIT",
      authoritativeDecision: "COMMITTED",
      recordedAt: "2026-10-10T09:33:00Z",
    })

    expect(reconciled.code).toBe("INSTALL-OK-INSTALLED")
    expect(reconciled.effect).toBe("ENGINE_LOCAL")
    expect(reconciled.target?.currentState).toEqual(candidate.stateSnapshot)
    expect(reconciled.receipt?.decision).toBe("COMMITTED")
    expect(target.snapshot().installReceipts).toHaveLength(2)
  })

  it("IGR-025 reconciles UNKNOWN to NOT_COMMITTED without state mutation", async () => {
    const candidate = await promotedCandidate({ label: "RECONCILE-NOT" })
    const target = freshTarget()
    const before = target.snapshot()
    const input = installInput(target, candidate, {
      operationId: "TEST-INSTALL-OP-RECONCILE-NOT",
      commitOutcome: "UNKNOWN",
    })
    installRestartCandidate(target, input)

    const reconciled = reconcileRestartInstall(target, {
      operationId: "TEST-INSTALL-OP-RECONCILE-NOT",
      authoritativeDecision: "NOT_COMMITTED",
      recordedAt: "2026-10-10T09:34:00Z",
    })

    expect(reconciled.code).toBe("INSTALL-OK-RECONCILED-NOT-COMMITTED")
    expect(reconciled.effect).toBe("NONE")
    expect(reconciled.receipt?.decision).toBe("NOT_COMMITTED")
    expect(target.snapshot().currentState).toEqual(before.currentState)
  })

  it("IGR-026 UNKNOWN reconciliation remains held", async () => {
    const candidate = await promotedCandidate({ label: "RECONCILE-STILL-UNKNOWN" })
    const target = freshTarget()
    installRestartCandidate(target, installInput(target, candidate, {
      operationId: "TEST-INSTALL-OP-STILL-UNKNOWN",
      commitOutcome: "UNKNOWN",
    }))

    const reconciled = reconcileRestartInstall(target, {
      operationId: "TEST-INSTALL-OP-STILL-UNKNOWN",
      authoritativeDecision: "UNKNOWN",
      recordedAt: "UNKNOWN",
    })

    expect(reconciled.code).toBe("INSTALL-HOLD-OPERATION-UNKNOWN")
    expect(reconciled.effect).toBe("NONE")
  })

  it("IGR-022 installs UNKNOWN_OUTCOME exactly without reconciling candidate history", async () => {
    const candidate = await promotedCandidate({
      label: "UNKNOWN-CANDIDATE",
      commands: commandsForUnknown("TEST-OP-INSTALL-CANDIDATE-UNKNOWN"),
    })
    expect(candidate.stateSnapshot.state).toBe("UNKNOWN_OUTCOME")

    const target = freshTarget()
    const result = installRestartCandidate(target, installInput(target, candidate, {
      operationId: "TEST-INSTALL-OP-UNKNOWN-CANDIDATE",
    }))

    expect(result.code).toBe("INSTALL-OK-INSTALLED")
    expect(result.target?.currentState.state).toBe("UNKNOWN_OUTCOME")
    expect(
      result.target?.currentState.admissionReceipts["TEST-OP-INSTALL-CANDIDATE-UNKNOWN"].decision,
    ).toBe("UNKNOWN")
  })

  it("IGR-023 installs routed historical state exactly without command replay", async () => {
    const candidate = await promotedCandidate({ label: "ROUTED-CANDIDATE" })
    expect(candidate.stateSnapshot.state).toBe("ROUTED")

    const target = freshTarget()
    const result = installRestartCandidate(target, installInput(target, candidate, {
      operationId: "TEST-INSTALL-OP-ROUTED",
    }))

    expect(result.code).toBe("INSTALL-OK-INSTALLED")
    expect(result.target?.currentState).toEqual(candidate.stateSnapshot)
    expect(result.target?.currentState.routeId).toBe("TEST-ROUTE-001")
    expect(result.target?.installReceipts).toHaveLength(1)
  })

  it("IGR-004/005 refuses missing, invalid, unknown, and live authority", async () => {
    const candidate = await promotedCandidate({ label: "AUTH" })

    const missingTarget = freshTarget("TEST-RUNTIME-AUTH-MISSING")
    expect(installRestartCandidate(missingTarget, {
      ...installInput(missingTarget, candidate),
      authorityRef: "",
    }).code).toBe("INSTALL-DENY-NO-AUTHORITY")

    const invalidTarget = freshTarget("TEST-RUNTIME-AUTH-INVALID")
    expect(installRestartCandidate(invalidTarget, {
      ...installInput(invalidTarget, candidate),
      authorityStatus: "INVALID",
    }).code).toBe("INSTALL-DENY-AUTHORITY-INVALID")

    const unknownTarget = freshTarget("TEST-RUNTIME-AUTH-UNKNOWN")
    expect(installRestartCandidate(unknownTarget, {
      ...installInput(unknownTarget, candidate),
      authorityStatus: "UNKNOWN",
    }).code).toBe("INSTALL-HOLD-AUTHORITY-UNKNOWN")

    const liveTarget = freshTarget("TEST-RUNTIME-AUTH-LIVE")
    expect(installRestartCandidate(liveTarget, {
      ...installInput(liveTarget, candidate),
      authorityRef: "LIVE-AUTHORITY",
    }).code).toBe("INSTALL-REFUSE-LIVE-ID")
  })

  it("IGR-002/003 refuses live target and operation identities", async () => {
    const candidate = await promotedCandidate({ label: "LIVE-ID" })
    const liveTarget = new SyntheticRestartInstallTarget("LIVE-RUNTIME")
    expect(installRestartCandidate(liveTarget, installInput(liveTarget, candidate)).code)
      .toBe("INSTALL-REFUSE-LIVE-ID")

    const target = freshTarget("TEST-RUNTIME-LIVE-OP")
    expect(installRestartCandidate(target, {
      ...installInput(target, candidate),
      operationId: "LIVE-OP",
    }).code).toBe("INSTALL-REFUSE-LIVE-ID")
  })

  it("IGR-008 holds candidate baseline mismatch", async () => {
    const candidate = await promotedCandidate({ label: "BASELINE" })
    const target = freshTarget()
    const result = installRestartCandidate(target, installInput(target, candidate, {
      allowedRuntimeArtifactRefs: ["TEST-OTHER-BASELINE"],
    }))

    expect(result.code).toBe("INSTALL-HOLD-BASELINE")
    expect(result.effect).toBe("NONE")
  })

  it("IGR-018 NOT_COMMITTED records history without replacing state", async () => {
    const candidate = await promotedCandidate({ label: "NOT-COMMITTED" })
    const target = freshTarget()
    const before = target.snapshot()
    const result = installRestartCandidate(target, installInput(target, candidate, {
      operationId: "TEST-INSTALL-OP-NOT-COMMITTED",
      commitOutcome: "NOT_COMMIT",
    }))

    expect(result.code).toBe("INSTALL-DENY-NOT-COMMITTED")
    expect(result.effect).toBe("NONE")
    expect(result.receipt?.decision).toBe("NOT_COMMITTED")
    expect(target.snapshot().currentState).toEqual(before.currentState)
  })

  it.each([
    ["autoInstall", true, "INSTALL-REFUSE-AUTO-INSTALL"],
    ["admit", true, "INSTALL-REFUSE-COMMAND-REPLAY"],
    ["bindSeed", true, "INSTALL-REFUSE-COMMAND-REPLAY"],
    ["evaluateRoute", true, "INSTALL-REFUSE-COMMAND-REPLAY"],
    ["commitRoute", true, "INSTALL-REFUSE-COMMAND-REPLAY"],
    ["append", true, "INSTALL-REFUSE-STORE-MUTATION"],
    ["repair", true, "INSTALL-REFUSE-STORE-MUTATION"],
    ["sourceMutation", "WRITE", "INSTALL-REFUSE-SOURCE-MUTATION"],
    ["network", true, "INSTALL-REFUSE-AUTO-INSTALL"],
    ["database", true, "INSTALL-REFUSE-AUTO-INSTALL"],
    ["cloud", true, "INSTALL-REFUSE-AUTO-INSTALL"],
  ])("IGR-027..031 refuses forbidden field %s", async (key, value, code) => {
    const candidate = await promotedCandidate({ label: `FORBIDDEN-${key}` })
    const target = freshTarget(`TEST-RUNTIME-FORBIDDEN-${key}`)
    const result = installRestartCandidate(target, {
      ...installInput(target, candidate),
      [key]: value,
    })
    expect(result.code).toBe(code)
    expect(result.effect).toBe("NONE")
  })

  it("IGR-010 rejects a forged target wrapper", async () => {
    const candidate = await promotedCandidate({ label: "FORGED-TARGET" })
    const real = freshTarget()
    const forged = {
      snapshot: () => real.snapshot(),
    } as unknown as SyntheticRestartInstallTarget

    const result = installRestartCandidate(forged, installInput(real, candidate))
    expect(result.code).toBe("INSTALL-INVALID-TARGET")
    expect(result.effect).toBe("NONE")
  })

  it("IGR-032 state fingerprint is deterministic and independent of object insertion order", () => {
    const state = createInterfaceState()
    const reordered = {
      admissionReceipts: state.admissionReceipts,
      packets: state.packets,
      state: state.state,
    } as InterfaceRuntimeState

    expect(restartInstallStateFingerprint(state)).toBe(
      restartInstallStateFingerprint(reordered),
    )
  })

  it("IGR-017 creating restart candidate and target never auto-installs", async () => {
    const candidate = await promotedCandidate({ label: "NO-AUTO" })
    const target = freshTarget("TEST-RUNTIME-NO-AUTO")
    const snapshot = target.snapshot()

    expect(candidate.stateSnapshot.state).toBe("ROUTED")
    expect(snapshot.currentState).toEqual(createInterfaceState())
    expect(snapshot.installReceipts).toHaveLength(0)
  })
})
