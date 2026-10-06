import { describe, expect, it } from "vitest"
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
import {
  buildRuntimeSignature,
  type RuntimeSignatureInput,
} from "../../src/runtime-signature/runtime-signature.js"
import {
  RECOVERY_SCHEMA_VERSION,
  createRecoveryEnvelope,
  recoveryEnvelopeHash,
  serializeRecoveryEnvelope,
  verifyRecoveryChain,
  verifyRecoveryEnvelope,
  type RecoveryEnvelope,
  type RecoveryEnvelopeInput,
  type RecoveryVerificationPolicy,
} from "../../src/pyramid/posix-secret-engine-recovery-envelope.js"

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
  commands: readonly HarnessCommand[] = canonicalHappyPath(),
  options: {
    sequence?: number
    previousEnvelopeHash?: string | null
    ancestry?: readonly string[]
    recordedAt?: string | "UNKNOWN"
    fixtureId?: string
  } = {},
): RecoveryEnvelope {
  const fixture = createDefaultNonprodFixture(
    options.fixtureId ? { fixtureId: options.fixtureId } : {},
  )
  const result = runNonprodScenario(fixture, commands)
  const signatureInput = signatureInputFromRun(result)

  return createRecoveryEnvelope({
    envelopeId,
    sequence: options.sequence ?? 0,
    previousEnvelopeHash: options.previousEnvelopeHash ?? null,
    runtimeArtifactRef: RUNTIME_BASELINE,
    harnessId: result.harnessId,
    scenarioId: result.fixtureId,
    stateSnapshot: result.finalState,
    signatureInput,
    runtimeSignature: result.signature,
    ancestry: options.ancestry ?? ["Pyramid-Talaru:190", "PositionIX", "SecretEngineRecoveryEnvelope"],
    boundaries: ["NON_PRODUCTION_ONLY", "SOURCE_MUTATION_NONE", "NO_AUTO_RECOVERY"],
    recordedAt: options.recordedAt ?? "2026-10-06T00:00:00Z",
    sourceMutation: "NONE",
  })
}

function rehash(envelope: RecoveryEnvelope): RecoveryEnvelope {
  const { envelopeHash: _old, ...body } = envelope
  return {
    ...structuredClone(body),
    envelopeHash: recoveryEnvelopeHash(body),
  } as RecoveryEnvelope
}

function withRawChange(
  envelope: RecoveryEnvelope,
  changes: Record<string, unknown>,
): RecoveryEnvelope {
  const raw = { ...structuredClone(envelope), ...changes } as unknown as RecoveryEnvelope
  return rehash(raw)
}

function envelopeFromState(
  envelopeId: string,
  scenarioId: string,
  state: InterfaceRuntimeState,
  ancestry: readonly string[],
): RecoveryEnvelope {
  const signatureInput: RuntimeSignatureInput = {
    scenarioId,
    initialState: createInterfaceState() as unknown as Readonly<Record<string, unknown>>,
    orderedActions: [],
    finalState: state as unknown as Readonly<Record<string, unknown>>,
    auditTrail: [],
    memoryIds: null,
  }
  return createRecoveryEnvelope({
    envelopeId,
    sequence: 0,
    previousEnvelopeHash: null,
    runtimeArtifactRef: RUNTIME_BASELINE,
    harnessId: "POSIX-SE-NONPROD-HARNESS-001",
    scenarioId,
    stateSnapshot: state,
    signatureInput,
    runtimeSignature: buildRuntimeSignature(signatureInput),
    ancestry,
    boundaries: ["NON_PRODUCTION_ONLY", "SOURCE_MUTATION_NONE", "NO_AUTO_RECOVERY"],
    recordedAt: "UNKNOWN",
    sourceMutation: "NONE",
  })
}

describe("POSITION IX → Secret Engine Recovery Envelope Contract 001", () => {
  it("REN-001..020 positive genesis verifies against an expected checkpoint", () => {
    const envelope = makeEnvelope("TEST-RECOVERY-GENESIS")
    const verified = verifyRecoveryChain(
      [envelope],
      policy,
      { sequence: 0, envelopeHash: envelope.envelopeHash },
    )
    expect(verified.code).toBe("RECOVERY-VALID-CANDIDATE")
    expect(verified.valid).toBe(true)
    expect(verified.completeChainFreshness).toBe(true)
    expect(verified.candidate?.stateSnapshot.state).toBe("ROUTED")
  })

  it("REN-003/004 descendant extends genesis append-only", () => {
    const genesis = makeEnvelope("TEST-RECOVERY-CHAIN-0")
    const descendant = makeEnvelope("TEST-RECOVERY-CHAIN-1", canonicalHappyPath(), {
      sequence: 1,
      previousEnvelopeHash: genesis.envelopeHash,
    })
    const verified = verifyRecoveryChain(
      [genesis, descendant],
      policy,
      { sequence: 1, envelopeHash: descendant.envelopeHash },
    )
    expect(verified.code).toBe("RECOVERY-VALID-CANDIDATE")
    expect(verified.candidate?.envelopeId).toBe(descendant.envelopeId)
  })

  it("REN-020 without checkpoint is LOCAL_INTEGRITY_ONLY", () => {
    const envelope = makeEnvelope("TEST-RECOVERY-LOCAL")
    const verified = verifyRecoveryChain([envelope], policy)
    expect(verified.code).toBe("LOCAL_INTEGRITY_ONLY")
    expect(verified.valid).toBe(true)
    expect(verified.completeChainFreshness).toBe(false)
  })

  it("REN-021 UNKNOWN_OUTCOME remains UNKNOWN in verified candidate", () => {
    const envelope = makeEnvelope(
      "TEST-RECOVERY-UNKNOWN",
      commandsForUnknown("TEST-OP-RECOVERY-UNKNOWN"),
    )
    const verified = verifyRecoveryEnvelope(envelope, policy)
    expect(verified.code).toBe("RECOVERY-VALID-CANDIDATE")
    expect(verified.candidate?.stateSnapshot.state).toBe("UNKNOWN_OUTCOME")
    expect(
      verified.candidate?.stateSnapshot.admissionReceipts["TEST-OP-RECOVERY-UNKNOWN"].decision,
    ).toBe("UNKNOWN")
  })

  it("REN-022 COMMITTED remains committed in verified candidate", () => {
    const envelope = makeEnvelope("TEST-RECOVERY-COMMITTED")
    const verified = verifyRecoveryEnvelope(envelope, policy)
    expect(verified.code).toBe("RECOVERY-VALID-CANDIDATE")
    expect(
      verified.candidate?.stateSnapshot.admissionReceipts["TEST-OP-001"].decision,
    ).toBe("COMMITTED")
  })

  it("REN-023 restart is a new lineage node and does not resolve prior UNKNOWN", () => {
    const prior = makeEnvelope(
      "TEST-RECOVERY-PRIOR-UNKNOWN",
      commandsForUnknown("TEST-OP-PRIOR-UNKNOWN"),
    )
    const restarted = envelopeFromState(
      "TEST-RECOVERY-RESTART",
      "TEST-FIXTURE-RESTART-001",
      createInterfaceState(),
      ["Pyramid-Talaru:190", `derivedFrom:${prior.envelopeHash}`],
    )

    const verified = verifyRecoveryEnvelope(restarted, policy)
    expect(verified.code).toBe("RECOVERY-VALID-CANDIDATE")
    expect(verified.candidate?.stateSnapshot.state).toBe("NO_PACKET")
    expect(prior.stateSnapshot.state).toBe("UNKNOWN_OUTCOME")
    expect(restarted.ancestry).toContain(`derivedFrom:${prior.envelopeHash}`)
  })

  it("REN-018 serialization and hashing are deterministic for the same content", () => {
    const a = makeEnvelope("TEST-RECOVERY-DETERMINISTIC")
    const b = makeEnvelope("TEST-RECOVERY-DETERMINISTIC")
    expect(a.envelopeHash).toBe(b.envelopeHash)
    expect(serializeRecoveryEnvelope(a)).toBe(serializeRecoveryEnvelope(b))
    expect(a.envelopeHash).toMatch(/^[0-9a-f]{64}$/)
  })

  it("CODE-002 unsupported schema holds", () => {
    const base = makeEnvelope("TEST-RECOVERY-BAD-SCHEMA")
    const invalid = withRawChange(base, { schemaVersion: "POSIX-SE-RECOVERY-9.9" })
    expect(verifyRecoveryEnvelope(invalid, policy).code).toBe("RECOVERY-HOLD-UNSUPPORTED-SCHEMA")
  })

  it("CODE-003 unsupported runtime baseline holds", () => {
    const base = makeEnvelope("TEST-RECOVERY-BAD-BASELINE")
    const invalid = withRawChange(base, { runtimeArtifactRef: "TEST-UNQUALIFIED-RUNTIME" })
    expect(verifyRecoveryEnvelope(invalid, policy).code).toBe("RECOVERY-HOLD-BASELINE-MISMATCH")
  })

  it("CODE-004 envelope hash tamper is detected", () => {
    const base = makeEnvelope("TEST-RECOVERY-HASH-TAMPER")
    const invalid = { ...base, envelopeHash: "0".repeat(64) } as RecoveryEnvelope
    expect(verifyRecoveryEnvelope(invalid, policy).code).toBe("RECOVERY-INVALID-ENVELOPE-HASH")
  })

  it("CODE-005 runtime signature tamper is detected after envelope digest is recomputed", () => {
    const base = makeEnvelope("TEST-RECOVERY-SIGNATURE-TAMPER")
    const invalid = rehash({
      ...structuredClone(base),
      runtimeSignature: {
        ...base.runtimeSignature,
        combinedHash: "deadbeef",
      },
    } as RecoveryEnvelope)
    expect(verifyRecoveryEnvelope(invalid, policy).code).toBe("RECOVERY-INVALID-SIGNATURE")
  })

  it("CODE-006 invalid receipt is detected after signature evidence remains internally consistent", () => {
    const base = makeEnvelope("TEST-RECOVERY-RECEIPT-TAMPER")
    const changedState = structuredClone(base.stateSnapshot)
    changedState.admissionReceipts["TEST-OP-001"].committedEventId = "tampered-event"

    const changedSignatureInput: RuntimeSignatureInput = {
      ...structuredClone(base.signatureInput),
      finalState: changedState as unknown as Readonly<Record<string, unknown>>,
    }
    const invalid = createRecoveryEnvelope({
      ...base,
      stateSnapshot: changedState,
      signatureInput: changedSignatureInput,
      runtimeSignature: buildRuntimeSignature(changedSignatureInput),
      envelopeHash: undefined,
    } as unknown as RecoveryEnvelopeInput)

    expect(verifyRecoveryEnvelope(invalid, policy).code).toBe("RECOVERY-INVALID-RECEIPT")
  })

  it("CODE-007 detects sequence gaps and reorder", () => {
    const genesis = makeEnvelope("TEST-RECOVERY-SEQ-0")
    const gap = makeEnvelope("TEST-RECOVERY-SEQ-2", canonicalHappyPath(), {
      sequence: 2,
      previousEnvelopeHash: genesis.envelopeHash,
    })
    expect(verifyRecoveryChain([genesis, gap], policy).code).toBe("RECOVERY-CONFLICT-SEQUENCE")
    expect(verifyRecoveryChain([gap, genesis], policy).code).toBe("RECOVERY-CONFLICT-SEQUENCE")
  })

  it("CODE-008 detects wrong previous envelope hash", () => {
    const genesis = makeEnvelope("TEST-RECOVERY-PREV-0")
    const descendant = makeEnvelope("TEST-RECOVERY-PREV-1", canonicalHappyPath(), {
      sequence: 1,
      previousEnvelopeHash: "f".repeat(64),
    })
    expect(verifyRecoveryChain([genesis, descendant], policy).code).toBe("RECOVERY-CONFLICT-PREV-HASH")
  })

  it("CODE-009 detects truncation relative to expected external checkpoint", () => {
    const genesis = makeEnvelope("TEST-RECOVERY-TRUNC-0")
    const descendant = makeEnvelope("TEST-RECOVERY-TRUNC-1", canonicalHappyPath(), {
      sequence: 1,
      previousEnvelopeHash: genesis.envelopeHash,
    })
    const truncated = verifyRecoveryChain(
      [genesis],
      policy,
      { sequence: 1, envelopeHash: descendant.envelopeHash },
    )
    expect(truncated.code).toBe("RECOVERY-CONFLICT-CHECKPOINT")
  })

  it("CODE-009 detects an alternate fork relative to expected external checkpoint", () => {
    const genesis = makeEnvelope("TEST-RECOVERY-FORK-0")
    const expected = makeEnvelope("TEST-RECOVERY-FORK-EXPECTED", canonicalHappyPath(), {
      sequence: 1,
      previousEnvelopeHash: genesis.envelopeHash,
    })
    const fork = makeEnvelope(
      "TEST-RECOVERY-FORK-OTHER",
      commandsForUnknown("TEST-OP-FORK"),
      {
        sequence: 1,
        previousEnvelopeHash: genesis.envelopeHash,
      },
    )
    const verified = verifyRecoveryChain(
      [genesis, fork],
      policy,
      { sequence: 1, envelopeHash: expected.envelopeHash },
    )
    expect(verified.code).toBe("RECOVERY-CONFLICT-CHECKPOINT")
  })

  it("CODE-010 state snapshot / signed final state mismatch is detected", () => {
    const base = makeEnvelope("TEST-RECOVERY-STATE-MISMATCH")
    const changed = structuredClone(base.stateSnapshot)
    changed.state = "ADMITTED"
    const invalid = rehash({ ...structuredClone(base), stateSnapshot: changed } as RecoveryEnvelope)
    expect(verifyRecoveryEnvelope(invalid, policy).code).toBe("RECOVERY-CONFLICT-STATE-EVIDENCE")
  })

  it("CODE-011 refuses non-test envelope identity", () => {
    const base = makeEnvelope("TEST-RECOVERY-LIVE-ID")
    const invalid = withRawChange(base, { envelopeId: "LIVE-RECOVERY-001" })
    expect(verifyRecoveryEnvelope(invalid, policy).code).toBe("RECOVERY-REFUSE-LIVE-ID")
  })

  it("CODE-011 refuses live identities embedded in recovered state", () => {
    const base = makeEnvelope("TEST-RECOVERY-LIVE-STATE")
    const changed = structuredClone(base.stateSnapshot)
    changed.routeId = "LIVE-ROUTE-001"
    const changedSignatureInput: RuntimeSignatureInput = {
      ...structuredClone(base.signatureInput),
      finalState: changed as unknown as Readonly<Record<string, unknown>>,
    }
    const invalid = createRecoveryEnvelope({
      ...base,
      stateSnapshot: changed,
      signatureInput: changedSignatureInput,
      runtimeSignature: buildRuntimeSignature(changedSignatureInput),
      envelopeHash: undefined,
    } as unknown as RecoveryEnvelopeInput)
    expect(verifyRecoveryEnvelope(invalid, policy).code).toBe("RECOVERY-REFUSE-LIVE-ID")
  })

  it("CODE-012 refuses auto-recovery command semantics", () => {
    const base = makeEnvelope("TEST-RECOVERY-AUTO")
    const raw = {
      ...structuredClone(base),
      autoRecover: true,
    } as unknown as RecoveryEnvelope
    const invalid = rehash(raw)
    expect(verifyRecoveryEnvelope(invalid, policy).code).toBe("RECOVERY-REFUSE-AUTO-RECOVERY")
  })

  it("CODE-012 refuses removal of required no-auto-recovery boundary", () => {
    const base = makeEnvelope("TEST-RECOVERY-BOUNDARY")
    const invalid = rehash({
      ...structuredClone(base),
      boundaries: ["NON_PRODUCTION_ONLY", "SOURCE_MUTATION_NONE"],
    } as RecoveryEnvelope)
    expect(verifyRecoveryEnvelope(invalid, policy).code).toBe("RECOVERY-REFUSE-AUTO-RECOVERY")
  })

  it("CODE-013 refuses source mutation semantics", () => {
    const base = makeEnvelope("TEST-RECOVERY-SOURCE-MUTATION")
    const invalid = withRawChange(base, { sourceMutation: "WRITE" })
    expect(verifyRecoveryEnvelope(invalid, policy).code).toBe("RECOVERY-REFUSE-SOURCE-MUTATION")
  })

  it("REC-009 candidate is isolated and immutable relative to envelope state", () => {
    const base = makeEnvelope("TEST-RECOVERY-CANDIDATE")
    const verified = verifyRecoveryEnvelope(base, policy)
    expect(verified.candidate).toBeDefined()
    expect(verified.candidate?.stateSnapshot).not.toBe(base.stateSnapshot)
    expect(Object.isFrozen(verified.candidate)).toBe(true)
    expect(Object.isFrozen(verified.candidate?.stateSnapshot)).toBe(true)
  })

  it("REC-010 verification never converts UNKNOWN into COMMITTED", () => {
    const envelope = makeEnvelope(
      "TEST-RECOVERY-NO-AUTO-DECISION",
      commandsForUnknown("TEST-OP-NO-AUTO-DECISION"),
    )
    const verified = verifyRecoveryEnvelope(envelope, policy)
    expect(verified.candidate?.stateSnapshot.state).toBe("UNKNOWN_OUTCOME")
    expect(
      verified.candidate?.stateSnapshot.admissionReceipts["TEST-OP-NO-AUTO-DECISION"].decision,
    ).toBe("UNKNOWN")
  })

  it("REC-015 exposes serialization only and no persistence side effect", () => {
    const envelope = makeEnvelope("TEST-RECOVERY-SERIALIZE-ONLY")
    const before = structuredClone(envelope)
    const serialized = serializeRecoveryEnvelope(envelope)
    expect(JSON.parse(serialized).envelopeId).toBe(envelope.envelopeId)
    expect(envelope).toEqual(before)
  })

  it("schema version remains frozen at POSIX-SE-RECOVERY-1.0", () => {
    expect(RECOVERY_SCHEMA_VERSION).toBe("POSIX-SE-RECOVERY-1.0")
  })
})
