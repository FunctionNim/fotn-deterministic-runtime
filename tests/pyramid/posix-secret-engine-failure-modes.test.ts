import { describe, expect, it } from "vitest"
import {
  admit,
  clonePacketWith,
  createInterfaceState,
  emitHandoff,
  installPacket,
  observe,
  validate,
  type HandoffPacket,
  type InterfaceRuntimeState,
} from "../../src/pyramid/posix-secret-engine-interface.js"
import {
  canonicalHappyPath,
  createDefaultNonprodFixture,
  createScenarioState,
  resetScenario,
  runNonprodScenario,
  type HarnessCommand,
} from "../../src/pyramid/posix-secret-engine-nonprod-harness.js"

function emittedPacket(): { state: InterfaceRuntimeState; packet: HandoffPacket } {
  const fixture = createDefaultNonprodFixture()
  const result = emitHandoff(createInterfaceState(), fixture.source, fixture.handoffId, fixture.observedAt)
  return { state: result.state, packet: result.state.packets[fixture.handoffId] }
}

function validateInstalled(packet: HandoffPacket) {
  let state = installPacket(createInterfaceState(), packet)
  state = observe(state, packet.handoffId).state
  return validate(state, packet.handoffId)
}

describe("POSITION IX → Secret Engine synthetic failure-mode suite FM-001..FM-018", () => {
  it("FM-001 missing sourceRefs holds with no engine mutation", () => {
    const result = runNonprodScenario(
      createDefaultNonprodFixture({ source: { sourceRefs: [] } }),
      [{ type: "EMIT_HANDOFF" }, { type: "OBSERVE" }, { type: "VALIDATE" }],
    )
    expect(result.receipts.at(-1)?.code).toBe("HOLD-MISSING-FIELD")
    expect(result.receipts.at(-1)?.engineEffect).toBe("NONE")
    expect(result.finalState.state).toBe("HOLD")
  })

  it("FM-002 unsupported schema holds before admission", () => {
    const { packet } = emittedPacket()
    const invalid = { ...packet, schemaVersion: "POSIX-SE-HANDOFF-9.9" } as unknown as HandoffPacket
    const result = validateInstalled(invalid)
    expect(result.code).toBe("HOLD-UNSUPPORTED-SCHEMA")
    expect(result.engineEffect).toBe("NONE")
    expect(result.state.state).toBe("HOLD")
  })

  it("FM-003 wrong handoff type is denied", () => {
    const { packet } = emittedPacket()
    const invalid = { ...packet, handoffType: "WRONG_TYPE" } as unknown as HandoffPacket
    const result = validateInstalled(invalid)
    expect(result.code).toBe("DENY-PRECONDITION")
    expect(result.engineEffect).toBe("NONE")
    expect(result.state.state).toBe("DENIED")
  })

  it("FM-004 invalid fingerprint holds", () => {
    const { packet } = emittedPacket()
    const invalid = { ...packet, semanticFingerprint: "not-the-semantic-fingerprint" }
    const result = validateInstalled(invalid)
    expect(result.code).toBe("INVALID-FINGERPRINT")
    expect(result.engineEffect).toBe("NONE")
    expect(result.state.state).toBe("HOLD")
  })

  it("FM-005 agentive Nothing language is refused", () => {
    const result = runNonprodScenario(
      createDefaultNonprodFixture({ source: { nextLawfulEdge: "The Nothing decided this" } }),
      [{ type: "EMIT_HANDOFF" }, { type: "OBSERVE" }, { type: "VALIDATE" }],
    )
    expect(result.receipts.at(-1)?.code).toBe("REFUSE-AGENTIVE-NOTHING")
    expect(result.receipts.at(-1)?.engineEffect).toBe("NONE")
    expect(result.finalState.state).toBe("REFUSED")
  })

  it("FM-006 admission-command next edge is refused", () => {
    const result = runNonprodScenario(
      createDefaultNonprodFixture({ source: { nextLawfulEdge: "ADMIT_NOW" } }),
      [{ type: "EMIT_HANDOFF" }, { type: "OBSERVE" }, { type: "VALIDATE" }],
    )
    expect(result.receipts.at(-1)?.code).toBe("REFUSE-AUTO-ADMIT")
    expect(result.receipts.at(-1)?.engineEffect).toBe("NONE")
  })

  it("FM-007 self-supersession conflicts", () => {
    const { packet } = emittedPacket()
    const invalid = clonePacketWith(packet, { supersedesId: packet.handoffId })
    const result = validateInstalled(invalid)
    expect(result.code).toBe("CONFLICT-ID-BODY")
    expect(result.engineEffect).toBe("NONE")
    expect(result.state.state).toBe("CONFLICT")
  })

  it("FM-008 dangling supersedes reference conflicts", () => {
    const { packet } = emittedPacket()
    const invalid = clonePacketWith(packet, { supersedesId: "TEST-HANDOFF-NOT-PRESENT" })
    const result = validateInstalled(invalid)
    expect(result.code).toBe("CONFLICT-SOURCE-MISMATCH")
    expect(result.engineEffect).toBe("NONE")
    expect(result.state.state).toBe("CONFLICT")
  })

  it("FM-009 duplicate same packet is a no-op", () => {
    const result = runNonprodScenario(
      createDefaultNonprodFixture(),
      [{ type: "EMIT_HANDOFF" }, { type: "EMIT_HANDOFF" }],
    )
    expect(result.receipts.map(r => r.code)).toEqual(["OK-HANDOFF", "OK-DUPLICATE"])
    expect(result.receipts[1].engineEffect).toBe("NONE")
    expect(Object.keys(result.finalState.packets)).toHaveLength(1)
  })

  it("FM-010 validate without packet holds unresolved source", () => {
    const result = runNonprodScenario(createDefaultNonprodFixture(), [{ type: "VALIDATE" }])
    expect(result.receipts[0].code).toBe("HOLD-UNRESOLVED-SOURCE")
    expect(result.receipts[0].engineEffect).toBe("NONE")
    expect(result.finalState.admissionReceipts).toEqual({})
  })

  it("FM-011 seed before admit is denied", () => {
    const result = runNonprodScenario(
      createDefaultNonprodFixture(),
      [{ type: "BIND_SEED", seedId: "TEST-SEED-FM011" }],
    )
    expect(result.receipts[0].code).toBe("DENY-PRECONDITION")
    expect(result.receipts[0].engineEffect).toBe("NONE")
    expect(result.finalState.seedId).toBeUndefined()
  })

  it("FM-012 route before eligibility is refused", () => {
    const result = runNonprodScenario(
      createDefaultNonprodFixture(),
      [{ type: "COMMIT_ROUTE", routeId: "TEST-ROUTE-FM012" }],
    )
    expect(result.receipts[0].code).toBe("REFUSE-AUTO-ROUTE")
    expect(result.receipts[0].engineEffect).toBe("NONE")
    expect(result.finalState.routeId).toBeUndefined()
  })

  it("FM-013 non-synthetic route ID is rejected before route mutation", () => {
    const commands: HarnessCommand[] = [
      { type: "EMIT_HANDOFF" },
      { type: "OBSERVE" },
      { type: "VALIDATE" },
      { type: "ADMIT", authorityRef: "TEST-AUTH-VALID", operationId: "TEST-OP-FM013", commitOutcome: "COMMIT" },
      { type: "BIND_SEED", seedId: "TEST-SEED-FM013" },
      { type: "EVALUATE_ROUTE" },
      { type: "COMMIT_ROUTE", routeId: "LIVE-ROUTE-FM013" },
    ]
    expect(() => runNonprodScenario(createDefaultNonprodFixture(), commands)).toThrow(/synthetic TEST-ROUTE-/)
  })

  it("FM-014 direct retry of committed ADMIT returns already committed with no second mutation", () => {
    const commands: HarnessCommand[] = [
      { type: "EMIT_HANDOFF" },
      { type: "OBSERVE" },
      { type: "VALIDATE" },
      { type: "ADMIT", authorityRef: "TEST-AUTH-VALID", operationId: "TEST-OP-FM014", commitOutcome: "COMMIT" },
      { type: "ADMIT", authorityRef: "TEST-AUTH-VALID", operationId: "TEST-OP-FM014", commitOutcome: "COMMIT" },
    ]
    const result = runNonprodScenario(createDefaultNonprodFixture(), commands)
    expect(result.receipts[3].code).toBe("OK-ADMITTED")
    expect(result.receipts[3].engineEffect).toBe("ENGINE_LOCAL")
    expect(result.receipts[4].code).toBe("OK-ALREADY-COMMITTED")
    expect(result.receipts[4].engineEffect).toBe("NONE")
    expect(Object.keys(result.finalState.admissionReceipts)).toEqual(["TEST-OP-FM014"])
    expect(result.finalState.admissionReceipts["TEST-OP-FM014"].committedEventId).toBe("posix-admit:TEST-OP-FM014")
  })

  it("FM-015 contradictory retry cannot overwrite a committed operation or regress later state", () => {
    const commands: HarnessCommand[] = [
      { type: "EMIT_HANDOFF" },
      { type: "OBSERVE" },
      { type: "VALIDATE" },
      { type: "ADMIT", authorityRef: "TEST-AUTH-VALID", operationId: "TEST-OP-FM015", commitOutcome: "COMMIT" },
      { type: "BIND_SEED", seedId: "TEST-SEED-FM015" },
      { type: "EVALUATE_ROUTE" },
      { type: "COMMIT_ROUTE", routeId: "TEST-ROUTE-FM015" },
      { type: "ADMIT", authorityRef: "TEST-AUTH-INVALID", operationId: "TEST-OP-FM015", commitOutcome: "NOT_COMMIT" },
    ]
    const result = runNonprodScenario(createDefaultNonprodFixture(), commands)
    expect(result.receipts.at(-1)?.code).toBe("OK-ALREADY-COMMITTED")
    expect(result.receipts.at(-1)?.engineEffect).toBe("NONE")
    expect(result.finalState.state).toBe("ROUTED")
    expect(result.finalState.routeId).toBe("TEST-ROUTE-FM015")
    expect(result.finalState.admissionReceipts["TEST-OP-FM015"].decision).toBe("COMMITTED")
    expect(result.finalState.admissionReceipts["TEST-OP-FM015"].committedEventId).toBe("posix-admit:TEST-OP-FM015")
  })

  it("FM-016 reset after HOLD, DENIED, REFUSED, or CONFLICT restores a clean baseline", () => {
    const baseline = createScenarioState()

    const held = runNonprodScenario(
      createDefaultNonprodFixture({ source: { sourceRefs: [] } }),
      [{ type: "EMIT_HANDOFF" }, { type: "OBSERVE" }, { type: "VALIDATE" }],
    )
    const denied = runNonprodScenario(
      createDefaultNonprodFixture(),
      [{ type: "BIND_SEED", seedId: "TEST-SEED-FM016" }],
    )
    const refused = runNonprodScenario(
      createDefaultNonprodFixture(),
      [{ type: "COMMIT_ROUTE", routeId: "TEST-ROUTE-FM016" }],
    )
    const { state, packet } = emittedPacket()
    const conflict = emitHandoff(
      state,
      { ...createDefaultNonprodFixture().source, consequenceEvidence: ["TEST-CONSEQUENCE-CONFLICT"] },
      packet.handoffId,
      createDefaultNonprodFixture().observedAt,
    )

    expect(held.finalState.state).toBe("HOLD")
    expect(denied.finalState.state).toBe("DENIED")
    expect(refused.finalState.state).toBe("REFUSED")
    expect(conflict.state.state).toBe("CONFLICT")

    for (const _failure of [held.finalState, denied.finalState, refused.finalState, conflict.state]) {
      const reset = resetScenario()
      expect(reset).toEqual(baseline)
      expect(reset).not.toBe(baseline)
    }
  })

  it("FM-017 identical replay yields identical signature and semantic outcome", () => {
    const a = runNonprodScenario(createDefaultNonprodFixture(), canonicalHappyPath())
    const b = runNonprodScenario(createDefaultNonprodFixture(), canonicalHappyPath())
    expect(a.signature).toEqual(b.signature)
    expect(a.finalState).toEqual(b.finalState)
    expect(a.receipts).toEqual(b.receipts)
  })

  it("FM-018 changed semantic input or command order yields replay divergence", () => {
    const baseline = runNonprodScenario(createDefaultNonprodFixture(), canonicalHappyPath())
    const changedInput = runNonprodScenario(
      createDefaultNonprodFixture({ source: { consequenceEvidence: ["TEST-CONSEQUENCE-DIVERGED"] } }),
      canonicalHappyPath(),
    )
    const changedOrder = runNonprodScenario(createDefaultNonprodFixture(), [
      { type: "EMIT_HANDOFF" },
      { type: "VALIDATE" },
      { type: "OBSERVE" },
      { type: "VALIDATE" },
    ])

    expect(changedInput.signature).not.toEqual(baseline.signature)
    expect(changedInput.finalState).not.toEqual(baseline.finalState)
    expect(changedOrder.signature).not.toEqual(baseline.signature)
    expect(changedOrder.receipts).not.toEqual(baseline.receipts)
  })
})

describe("admission idempotency correction", () => {
  it("preserves an already-committed receipt even when retried from a later state", () => {
    const completed = runNonprodScenario(createDefaultNonprodFixture(), [
      { type: "EMIT_HANDOFF" },
      { type: "OBSERVE" },
      { type: "VALIDATE" },
      { type: "ADMIT", authorityRef: "TEST-AUTH-VALID", operationId: "TEST-OP-IDEMP", commitOutcome: "COMMIT" },
      { type: "BIND_SEED", seedId: "TEST-SEED-IDEMP" },
      { type: "EVALUATE_ROUTE" },
      { type: "COMMIT_ROUTE", routeId: "TEST-ROUTE-IDEMP" },
    ])

    const result = admit(completed.finalState, {
      authorityRef: "TEST-AUTH-INVALID",
      authorityStatus: "INVALID",
      operationId: "TEST-OP-IDEMP",
      commitOutcome: "NOT_COMMIT",
    })

    expect(result.code).toBe("OK-ALREADY-COMMITTED")
    expect(result.engineEffect).toBe("NONE")
    expect(result.state).toEqual(completed.finalState)
    expect(result.receipt).toEqual(completed.finalState.admissionReceipts["TEST-OP-IDEMP"])
  })
})
