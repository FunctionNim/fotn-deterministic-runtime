import { mkdtemp, mkdir, readFile, readdir, rename, rm, symlink, writeFile } from "node:fs/promises"
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
import {
  buildRuntimeSignature,
  type RuntimeSignatureInput,
} from "../../src/runtime-signature/runtime-signature.js"
import {
  createRecoveryEnvelope,
  serializeRecoveryEnvelope,
  type RecoveryEnvelope,
  type RecoveryVerificationPolicy,
} from "../../src/pyramid/posix-secret-engine-recovery-envelope.js"
import {
  LocalTempRecoveryStore,
  RECOVERY_STORE_SCHEMA_VERSION,
  type RecoveryStoreObservedHead,
} from "../../src/pyramid/posix-secret-engine-local-temp-recovery-store.js"

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
    ancestry: options.ancestry ?? ["Pyramid-Talaru:206", "RecoveryStoreContract:205A"],
    boundaries: ["NON_PRODUCTION_ONLY", "SOURCE_MUTATION_NONE", "NO_AUTO_RECOVERY"],
    recordedAt: "2026-10-09T00:00:00Z",
    sourceMutation: "NONE",
  })
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

function recordName(envelope: RecoveryEnvelope): string {
  return `${String(envelope.sequence).padStart(12, "0")}-${envelope.envelopeHash}.json`
}

describe("POSITION IX → Secret Engine local-temp recovery store contract 001", () => {
  let parent: string
  let root: string

  beforeEach(async () => {
    parent = await mkdtemp(join(tmpdir(), "posix-se-store-parent-"))
    root = join(parent, "store")
    await mkdir(root)
  })

  afterEach(async () => {
    await rm(parent, { recursive: true, force: true })
  })

  function makeStore(overrides: Partial<ConstructorParameters<typeof LocalTempRecoveryStore>[0]> = {}) {
    return new LocalTempRecoveryStore({
      storeSchemaVersion: RECOVERY_STORE_SCHEMA_VERSION,
      storeId: "TEST-STORE-001",
      chainId: "TEST-CHAIN-001",
      root,
      expectedTestTempParent: parent,
      recoveryPolicy: policy,
      ...overrides,
    })
  }

  it("RST-009/015 stores verified genesis and returns observational head", async () => {
    const store = makeStore()
    const genesis = makeEnvelope("TEST-RECOVERY-STORE-GENESIS")
    const appended = await store.append(genesis)

    expect(appended.code).toBe("STORE-OK-STORED")
    expect(appended.effect).toBe("STORE_LOCAL")
    expect(appended.observedHead).toEqual({
      sequence: 0,
      envelopeHash: genesis.envelopeHash,
    })

    const bytes = await readFile(join(root, recordName(genesis)), "utf8")
    expect(bytes).toBe(serializeRecoveryEnvelope(genesis))
  })

  it("RST-010/011 stores an exact descendant only with matching observed-head precondition", async () => {
    const store = makeStore()
    const genesis = makeEnvelope("TEST-RECOVERY-STORE-CHAIN-0")
    const first = await store.append(genesis)
    const descendant = makeEnvelope("TEST-RECOVERY-STORE-CHAIN-1", {
      sequence: 1,
      previousEnvelopeHash: genesis.envelopeHash,
    })

    const second = await store.append(descendant, {
      expectedObservedHead: first.observedHead,
    })
    expect(second.code).toBe("STORE-OK-STORED")
    expect(second.observedHead?.sequence).toBe(1)
  })

  it("RST-016 exact duplicate append is idempotent with no new mutation", async () => {
    const store = makeStore()
    const genesis = makeEnvelope("TEST-RECOVERY-STORE-DUP")
    expect((await store.append(genesis)).code).toBe("STORE-OK-STORED")

    const retry = await store.append(genesis)
    expect(retry.code).toBe("STORE-OK-ALREADY-STORED")
    expect(retry.effect).toBe("NONE")
    expect((await readdir(root)).filter(name => name.endsWith(".json"))).toHaveLength(1)
  })

  it("RST-027 UNKNOWN_OUTCOME exact retry remains UNKNOWN and idempotent", async () => {
    const store = makeStore()
    const unknown = makeEnvelope("TEST-RECOVERY-STORE-UNKNOWN", {
      commands: commandsForUnknown("TEST-OP-STORE-UNKNOWN"),
    })
    expect((await store.append(unknown)).code).toBe("STORE-OK-STORED")
    expect((await store.append(unknown)).code).toBe("STORE-OK-ALREADY-STORED")

    const loaded = await store.loadVerifiedChain({
      sequence: 0,
      envelopeHash: unknown.envelopeHash,
    })
    expect(loaded.code).toBe("STORE-VALID-CANDIDATE")
    expect(loaded.candidate?.stateSnapshot.state).toBe("UNKNOWN_OUTCOME")
    expect(
      loaded.candidate?.stateSnapshot.admissionReceipts["TEST-OP-STORE-UNKNOWN"].decision,
    ).toBe("UNKNOWN")
  })

  it("RST-023 load without external checkpoint is local-integrity-only", async () => {
    const store = makeStore()
    const genesis = makeEnvelope("TEST-RECOVERY-STORE-LOCAL")
    await store.append(genesis)

    const loaded = await store.loadVerifiedChain()
    expect(loaded.code).toBe("STORE-LOCAL-INTEGRITY-ONLY")
    expect(loaded.observedHead?.envelopeHash).toBe(genesis.envelopeHash)
    expect(loaded.candidate?.envelopeId).toBe(genesis.envelopeId)
  })

  it("RST-024 load with caller checkpoint returns verified candidate", async () => {
    const store = makeStore()
    const genesis = makeEnvelope("TEST-RECOVERY-STORE-CHECKPOINT")
    await store.append(genesis)

    const loaded = await store.loadVerifiedChain({
      sequence: 0,
      envelopeHash: genesis.envelopeHash,
    })
    expect(loaded.code).toBe("STORE-VALID-CANDIDATE")
    expect(loaded.candidate?.envelopeId).toBe(genesis.envelopeId)
  })

  it("RST-025 caller checkpoint detects a locally valid truncation", async () => {
    const store = makeStore()
    const genesis = makeEnvelope("TEST-RECOVERY-STORE-TRUNC-0")
    const first = await store.append(genesis)
    const descendant = makeEnvelope("TEST-RECOVERY-STORE-TRUNC-1", {
      sequence: 1,
      previousEnvelopeHash: genesis.envelopeHash,
    })
    await store.append(descendant, { expectedObservedHead: first.observedHead })

    await rm(join(root, recordName(descendant)))

    const local = await store.loadVerifiedChain()
    expect(local.code).toBe("STORE-LOCAL-INTEGRITY-ONLY")

    const checked = await store.loadVerifiedChain({
      sequence: 1,
      envelopeHash: descendant.envelopeHash,
    })
    expect(checked.code).toBe("STORE-CONFLICT-CHECKPOINT")
  })

  it("RST-008/017 refuses a conflicting same-sequence record", async () => {
    const store = makeStore()
    const genesis = makeEnvelope("TEST-RECOVERY-STORE-SLOT")
    await store.append(genesis)
    const conflict = makeEnvelope("TEST-RECOVERY-STORE-SLOT-OTHER")

    await writeFile(join(root, recordName(conflict)), serializeRecoveryEnvelope(conflict), "utf8")
    const loaded = await store.loadVerifiedChain()
    expect(loaded.code).toBe("STORE-CONFLICT-FORK")
  })

  it("RST-018 detects a fork with two finalized sequence-one records", async () => {
    const store = makeStore()
    const genesis = makeEnvelope("TEST-RECOVERY-STORE-FORK-0")
    const first = await store.append(genesis)
    const left = makeEnvelope("TEST-RECOVERY-STORE-FORK-L", {
      sequence: 1,
      previousEnvelopeHash: genesis.envelopeHash,
    })
    await store.append(left, { expectedObservedHead: first.observedHead })

    const right = makeEnvelope("TEST-RECOVERY-STORE-FORK-R", {
      sequence: 1,
      previousEnvelopeHash: genesis.envelopeHash,
      commands: commandsForUnknown("TEST-OP-STORE-FORK"),
    })
    await writeFile(join(root, recordName(right)), serializeRecoveryEnvelope(right), "utf8")

    expect((await store.loadVerifiedChain()).code).toBe("STORE-CONFLICT-FORK")
  })

  it("RST-019 detects a sequence gap", async () => {
    const store = makeStore()
    const genesis = makeEnvelope("TEST-RECOVERY-STORE-GAP-0")
    await store.append(genesis)
    const gap = makeEnvelope("TEST-RECOVERY-STORE-GAP-2", {
      sequence: 2,
      previousEnvelopeHash: genesis.envelopeHash,
    })
    await writeFile(join(root, recordName(gap)), serializeRecoveryEnvelope(gap), "utf8")

    expect((await store.loadVerifiedChain()).code).toBe("STORE-CONFLICT-SEQUENCE")
  })

  it("RST-020 rejects malformed finalized JSON", async () => {
    const store = makeStore()
    await writeFile(join(root, `000000000000-${"a".repeat(64)}.json`), "{bad-json", "utf8")
    expect((await store.loadVerifiedChain()).code).toBe("STORE-INVALID-RECORD")
  })

  it("RST-020 rejects filename/content identity mismatch", async () => {
    const store = makeStore()
    const genesis = makeEnvelope("TEST-RECOVERY-STORE-NAME-MISMATCH")
    await writeFile(
      join(root, `000000000000-${"b".repeat(64)}.json`),
      serializeRecoveryEnvelope(genesis),
      "utf8",
    )
    expect((await store.loadVerifiedChain()).code).toBe("STORE-INVALID-RECORD")
  })

  it("RST-020 rejects non-canonical/tampered finalized bytes", async () => {
    const store = makeStore()
    const genesis = makeEnvelope("TEST-RECOVERY-STORE-TAMPER")
    await store.append(genesis)
    const path = join(root, recordName(genesis))
    const parsed = JSON.parse(await readFile(path, "utf8")) as Record<string, unknown>
    parsed.recordedAt = "tampered"
    await writeFile(path, JSON.stringify(parsed), "utf8")

    expect((await store.loadVerifiedChain()).code).toBe("STORE-INVALID-RECORD")
  })

  it("RST-026 refuses unsupported runtime baseline before write", async () => {
    const store = makeStore()
    const invalid = makeEnvelope("TEST-RECOVERY-STORE-BASELINE", {
      runtimeArtifactRef: "TEST-UNQUALIFIED-RUNTIME",
    })
    const outcome = await store.append(invalid)
    expect(outcome.code).toBe("STORE-HOLD-BASELINE")
    expect((await readdir(root)).filter(name => name.endsWith(".json"))).toHaveLength(0)
  })

  it("RST-021 orphan staging is diagnostic and excluded from history", async () => {
    const store = makeStore()
    await writeFile(join(root, ".posix-se-store-TEST-STORE-001-orphan.tmp"), "partial", "utf8")
    const loaded = await store.loadVerifiedChain()
    expect(loaded.code).toBe("STORE-HOLD-ORPHAN-STAGING")
    expect(loaded.diagnostics).toContain(".posix-se-store-TEST-STORE-001-orphan.tmp")
  })

  it("RST-022 unknown files are not treated as recovery evidence", async () => {
    const store = makeStore()
    const genesis = makeEnvelope("TEST-RECOVERY-STORE-UNKNOWN-FILE")
    await writeFile(join(root, "notes.txt"), "not evidence", "utf8")
    await store.append(genesis)

    expect((await store.loadVerifiedChain()).code).toBe("STORE-LOCAL-INTEGRITY-ONLY")
  })

  it("RST-008 blocks append onto a corrupted existing chain", async () => {
    const store = makeStore()
    const genesis = makeEnvelope("TEST-RECOVERY-STORE-BROKEN-0")
    const first = await store.append(genesis)
    const path = join(root, recordName(genesis))
    await writeFile(path, "{}", "utf8")

    const descendant = makeEnvelope("TEST-RECOVERY-STORE-BROKEN-1", {
      sequence: 1,
      previousEnvelopeHash: genesis.envelopeHash,
    })
    const outcome = await store.append(descendant, {
      expectedObservedHead: first.observedHead,
    })
    expect(outcome.code).toBe("STORE-INVALID-RECORD")
    expect((await readdir(root)).filter(name => name.endsWith(".json"))).toHaveLength(1)
  })

  it("RST-011 observed-head race refuses stale writer before mutation", async () => {
    const store = makeStore()
    const genesis = makeEnvelope("TEST-RECOVERY-STORE-RACE-0")
    const first = await store.append(genesis)
    const observedGenesis = first.observedHead as RecoveryStoreObservedHead

    const winner = makeEnvelope("TEST-RECOVERY-STORE-RACE-WINNER", {
      sequence: 1,
      previousEnvelopeHash: genesis.envelopeHash,
    })
    expect((await store.append(winner, { expectedObservedHead: observedGenesis })).code)
      .toBe("STORE-OK-STORED")

    const stale = makeEnvelope("TEST-RECOVERY-STORE-RACE-STALE", {
      sequence: 2,
      previousEnvelopeHash: winner.envelopeHash,
    })
    const outcome = await store.append(stale, { expectedObservedHead: observedGenesis })
    expect(outcome.code).toBe("STORE-CONFLICT-HEAD-CHANGED")
    expect((await readdir(root)).filter(name => name.endsWith(".json"))).toHaveLength(2)
  })

  it("RST-004/031 refuses symlinked store root", async () => {
    const realRoot = root
    const linkedRoot = join(parent, "store-link")
    await symlink(realRoot, linkedRoot, "dir")

    const store = makeStore({ root: linkedRoot })
    const outcome = await store.append(makeEnvelope("TEST-RECOVERY-STORE-SYMLINK-ROOT"))
    expect(outcome.code).toBe("STORE-REFUSE-PATH")
  })

  it("RST-004 refuses a store root outside the explicitly supplied temp parent", async () => {
    const otherParent = await mkdtemp(join(tmpdir(), "posix-se-store-other-"))
    try {
      const otherRoot = join(otherParent, "store")
      await mkdir(otherRoot)
      const store = makeStore({ root: otherRoot })
      const outcome = await store.append(makeEnvelope("TEST-RECOVERY-STORE-OUTSIDE"))
      expect(outcome.code).toBe("STORE-REFUSE-PATH")
    } finally {
      await rm(otherParent, { recursive: true, force: true })
    }
  })

  it("RST-002/003 refuses non-test store or chain identities", async () => {
    const envelope = makeEnvelope("TEST-RECOVERY-STORE-LIVE-ID")
    expect((await makeStore({ storeId: "LIVE-STORE" }).append(envelope)).code)
      .toBe("STORE-REFUSE-LIVE-ID")
    expect((await makeStore({ chainId: "LIVE-CHAIN" }).append(envelope)).code)
      .toBe("STORE-REFUSE-LIVE-ID")
  })

  it("RST-001 refuses unsupported store schema", async () => {
    const store = makeStore({
      storeSchemaVersion: "POSIX-SE-RECOVERY-STORE-9.9" as typeof RECOVERY_STORE_SCHEMA_VERSION,
    })
    expect((await store.append(makeEnvelope("TEST-RECOVERY-STORE-SCHEMA"))).code)
      .toBe("STORE-HOLD-UNSUPPORTED-SCHEMA")
  })

  it("RST-029 restart lineage persists without claiming prior UNKNOWN resolution", async () => {
    const priorStore = makeStore()
    const prior = makeEnvelope("TEST-RECOVERY-STORE-PRIOR-UNKNOWN", {
      commands: commandsForUnknown("TEST-OP-STORE-PRIOR-UNKNOWN"),
    })
    await priorStore.append(prior)

    const restartRoot = join(parent, "restart-store")
    await mkdir(restartRoot)
    const restartStore = makeStore({
      root: restartRoot,
      storeId: "TEST-STORE-RESTART",
      chainId: "TEST-CHAIN-RESTART",
    })
    const restarted = envelopeFromState(
      "TEST-RECOVERY-STORE-RESTART",
      "TEST-FIXTURE-STORE-RESTART",
      createInterfaceState(),
      ["Pyramid-Talaru:206", `derivedFrom:${prior.envelopeHash}`],
    )
    await restartStore.append(restarted)
    const loaded = await restartStore.loadVerifiedChain({
      sequence: 0,
      envelopeHash: restarted.envelopeHash,
    })

    expect(loaded.code).toBe("STORE-VALID-CANDIDATE")
    expect(loaded.candidate?.stateSnapshot.state).toBe("NO_PACKET")
    expect(prior.stateSnapshot.state).toBe("UNKNOWN_OUTCOME")
  })

  it("RST-013 exposes no overwrite/delete/truncate/compact API", () => {
    const store = makeStore() as unknown as Record<string, unknown>
    expect(store.overwrite).toBeUndefined()
    expect(store.delete).toBeUndefined()
    expect(store.truncate).toBeUndefined()
    expect(store.compact).toBeUndefined()
  })

  it("RST-033 exposes no load-and-install or runtime command API", () => {
    const store = makeStore() as unknown as Record<string, unknown>
    expect(store.restore).toBeUndefined()
    expect(store.resume).toBeUndefined()
    expect(store.admit).toBeUndefined()
    expect(store.bindSeed).toBeUndefined()
    expect(store.commitRoute).toBeUndefined()
  })

  it("RST-035 reference adapter exposes no network/database/cloud backend surface", () => {
    const store = makeStore() as unknown as Record<string, unknown>
    expect(store.connect).toBeUndefined()
    expect(store.upload).toBeUndefined()
    expect(store.download).toBeUndefined()
    expect(store.query).toBeUndefined()
  })

  it("record finalization leaves no staging file after successful append", async () => {
    const store = makeStore()
    await store.append(makeEnvelope("TEST-RECOVERY-STORE-NO-STAGING"))
    const names = await readdir(root)
    expect(names.some(name => name.endsWith(".tmp"))).toBe(false)
    expect(names.filter(name => name.endsWith(".json"))).toHaveLength(1)
  })

  it("final record path is generated from sequence and envelope hash only", async () => {
    const store = makeStore()
    const envelope = makeEnvelope("TEST-RECOVERY-STORE-GENERATED-NAME")
    await store.append(envelope)
    expect(await readdir(root)).toContain(recordName(envelope))
  })
})
