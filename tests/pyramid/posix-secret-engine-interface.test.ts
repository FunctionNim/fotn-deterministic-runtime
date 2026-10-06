import { describe, expect, it } from "vitest"
import {
  admit,
  bindSeed,
  clonePacketWith,
  commitRoute,
  createInterfaceState,
  emitHandoff,
  evaluateRoute,
  installPacket,
  observe,
  reconcile,
  refuseSourceMutation,
  validate,
  type HandoffPacket,
  type InterfaceRuntimeState,
  type PositionIXSource,
} from "../../src/pyramid/posix-secret-engine-interface.js"

const observedAt = "2026-10-05T12:00:00Z"

function source(overrides: Partial<PositionIXSource> = {}): PositionIXSource {
  return {
    sourcePositionIxId: "POSIX-001",
    sourceRefs: ["Pyramid-Talaru:131"],
    accountabilityState: "ACCOUNTABLE",
    consequenceEvidence: ["consequence:changed-state"],
    unresolvedFields: [],
    contradictions: [],
    qualificationOutcome: "QUALIFIED_FOR_RETURN",
    returnEligibility: "ELIGIBLE",
    boundaries: ["NON_AGENTIVE_NOTHING", "NO_AUTO_ADMISSION"],
    ancestry: ["PositionIX", "SecretEnginePreRoutePatch"],
    nextLawfulEdge: "SECRET_ENGINE_CONSIDERATION",
    occurredAt: "UNKNOWN",
    ...overrides,
  }
}

function emitted(s: PositionIXSource = source(), id = "H-001"): InterfaceRuntimeState {
  return emitHandoff(createInterfaceState(), s, id, observedAt).state
}

function observed(s: PositionIXSource = source(), id = "H-001"): InterfaceRuntimeState {
  return observe(emitted(s, id), id).state
}

function admissible(s: PositionIXSource = source(), id = "H-001"): InterfaceRuntimeState {
  return validate(observed(s, id), id).state
}

function admitted(operationId = "OP-001"): InterfaceRuntimeState {
  return admit(admissible(), {
    authorityRef: "AUTH-001",
    authorityStatus: "VALID",
    operationId,
    commitOutcome: "COMMIT",
  }).state
}

describe("POSITION IX → Secret Engine conformance fixtures T-001..T-024", () => {
  it("T-001 emits a handoff from a qualified accountable Position IX receipt", () => {
    const result = emitHandoff(createInterfaceState(), source(), "H-001", observedAt)
    expect(result.code).toBe("OK-HANDOFF")
    expect(result.engineEffect).toBe("NONE")
    expect(result.state.state).toBe("HANDOFF_EMITTED")
    expect(result.state.packets["H-001"].sourceRefs).toEqual(["Pyramid-Talaru:131"])
  })

  it("T-002 emits no packet from pre-route material with no accountable consequence", () => {
    const result = emitHandoff(createInterfaceState(), source({ accountabilityState: "PRE_ROUTE" }), "H-002", observedAt)
    expect(result.code).toBe("NO-HANDOFF")
    expect(result.state.state).toBe("NO_PACKET")
    expect(Object.keys(result.state.packets)).toHaveLength(0)
  })

  it("T-003 observes a valid packet without engine mutation", () => {
    const result = observe(emitted(), "H-001")
    expect(result.code).toBe("OK-OBSERVED")
    expect(result.engineEffect).toBe("NONE")
    expect(result.state.state).toBe("OBSERVED")
  })

  it("T-004 validation ends at ADMISSIBLE_NOT_ADMITTED", () => {
    const result = validate(observed(), "H-001")
    expect(result.code).toBe("OK-VALID")
    expect(result.engineEffect).toBe("NONE")
    expect(result.state.state).toBe("ADMISSIBLE_NOT_ADMITTED")
    expect(result.state.seedId).toBeUndefined()
  })

  it("T-005 missing source refs holds before admission", () => {
    let state = emitted()
    const original = state.packets["H-001"]
    const invalid = clonePacketWith(original, { sourceRefs: [] })
    state = installPacket(createInterfaceState(), invalid)
    state = observe(state, invalid.handoffId).state
    const result = validate(state, invalid.handoffId)
    expect(result.code).toBe("HOLD-MISSING-FIELD")
    expect(result.engineEffect).toBe("NONE")
  })

  it("T-006 same ID with changed semantic body conflicts instead of overwriting", () => {
    const state = emitted()
    const result = emitHandoff(
      state,
      source({ consequenceEvidence: ["consequence:different"] }),
      "H-001",
      observedAt,
    )
    expect(result.code).toBe("CONFLICT-ID-BODY")
    expect(result.engineEffect).toBe("NONE")
    expect(result.state.packets["H-001"].consequenceEvidence).toEqual(["consequence:changed-state"])
  })

  it("T-007 UNKNOWN accountability cannot emit a handoff", () => {
    const result = emitHandoff(createInterfaceState(), source({ accountabilityState: "UNKNOWN" }), "H-007", observedAt)
    expect(result.code).toBe("NO-HANDOFF")
    expect(result.engineEffect).toBe("NONE")
  })

  it("T-008 admission without authority is denied without mutation", () => {
    const result = admit(admissible(), {
      authorityStatus: "VALID",
      operationId: "OP-008",
      commitOutcome: "COMMIT",
    })
    expect(result.code).toBe("DENY-NO-AUTHORITY")
    expect(result.engineEffect).toBe("NONE")
  })

  it("T-009 valid authority and unique operation commits exactly one admission", () => {
    const result = admit(admissible(), {
      authorityRef: "AUTH-001",
      authorityStatus: "VALID",
      operationId: "OP-009",
      commitOutcome: "COMMIT",
    })
    expect(result.code).toBe("OK-ADMITTED")
    expect(result.engineEffect).toBe("ENGINE_LOCAL")
    expect(result.receipt?.decision).toBe("COMMITTED")
    expect(result.receipt?.committedEventId).toBe("posix-admit:OP-009")
  })

  it("T-010 response loss after commit reconciles to already committed with no second mutation", () => {
    const base = admissible()
    const unknown = admit(base, {
      authorityRef: "AUTH-001",
      authorityStatus: "VALID",
      operationId: "OP-010",
      commitOutcome: "UNKNOWN",
    }).state
    const result = reconcile(unknown, "OP-010", "COMMITTED")
    expect(result.code).toBe("OK-ALREADY-COMMITTED")
    expect(result.engineEffect).toBe("NONE")
    expect(result.state.state).toBe("ADMITTED")
    expect(result.receipt?.decision).toBe("COMMITTED")
  })

  it("T-011 unavailable authoritative outcome remains STOP_UNKNOWN", () => {
    const unknown = admit(admissible(), {
      authorityRef: "AUTH-001",
      authorityStatus: "VALID",
      operationId: "OP-011",
      commitOutcome: "UNKNOWN",
    }).state
    const result = reconcile(unknown, "OP-011", "UNKNOWN")
    expect(result.code).toBe("HOLD-OPERATION-UNKNOWN")
    expect(result.engineEffect).toBe("NONE")
    expect(result.state.state).toBe("UNKNOWN_OUTCOME")
  })

  it("T-012 seed binding is allowed only after admission", () => {
    const result = bindSeed(admitted("OP-012"), "SEED-012")
    expect(result.code).toBe("OK-SEED-BOUND")
    expect(result.engineEffect).toBe("ENGINE_LOCAL")
    expect(result.state.state).toBe("SEED_BOUND")
    expect(result.state.seedId).toBe("SEED-012")
  })

  it("T-013 seed binding before admission is denied", () => {
    const result = bindSeed(admissible(), "SEED-013")
    expect(result.code).toBe("DENY-PRECONDITION")
    expect(result.engineEffect).toBe("NONE")
  })

  it("T-014 route commit before seed is refused", () => {
    const result = commitRoute(admitted("OP-014"), "ROUTE-014")
    expect(result.code).toBe("REFUSE-AUTO-ROUTE")
    expect(result.engineEffect).toBe("NONE")
  })

  it("T-015 post-seed route evaluation is read-only and can become eligible", () => {
    const seeded = bindSeed(admitted("OP-015"), "SEED-015").state
    const result = evaluateRoute(seeded)
    expect(result.code).toBe("OK-ROUTE-ELIGIBLE")
    expect(result.engineEffect).toBe("NONE")
    expect(result.state.state).toBe("ROUTE_ELIGIBLE")
  })

  it("T-016 authorized route commit occurs only after route eligibility", () => {
    const seeded = bindSeed(admitted("OP-016"), "SEED-016").state
    const eligible = evaluateRoute(seeded).state
    const result = commitRoute(eligible, "ROUTE-016")
    expect(result.code).toBe("OK-ROUTED")
    expect(result.engineEffect).toBe("ENGINE_LOCAL")
    expect(result.state.routeId).toBe("ROUTE-016")
  })

  it("T-017 blocking contradiction holds validation and preserves evidence", () => {
    const s = source({ contradictions: [{ ref: "CONTRA-17", blocking: true }] })
    const state = observed(s)
    const result = validate(state, "H-001")
    expect(result.code).toBe("HOLD-BLOCKING-CONTRADICTION")
    expect(result.engineEffect).toBe("NONE")
    expect(result.state.packets["H-001"].contradictions[0].ref).toBe("CONTRA-17")
  })

  it("T-018 unknown occurrence time is preserved while observation time remains known", () => {
    const state = observed(source({ occurredAt: "UNKNOWN" }))
    const result = validate(state, "H-001")
    expect(result.code).toBe("OK-VALID")
    const packet = result.state.packets["H-001"]
    expect(packet.occurredAt).toBe("UNKNOWN")
    expect(packet.observedAt).toBe(observedAt)
  })

  it("T-019 governing-source mutation is always refused", () => {
    const result = refuseSourceMutation(admissible())
    expect(result.code).toBe("REFUSE-SOURCE-MUTATION")
    expect(result.engineEffect).toBe("NONE")
  })

  it("T-020 agentive Nothing metadata is refused by validation", () => {
    const s = source({ nextLawfulEdge: "The Nothing admitted this" })
    const state = observed(s)
    const result = validate(state, "H-001")
    expect(result.code).toBe("REFUSE-AGENTIVE-NOTHING")
    expect(result.engineEffect).toBe("NONE")
  })

  it("T-021 repeated observation of the same packet is a duplicate no-op", () => {
    const once = observe(emitted(), "H-001").state
    const result = observe(once, "H-001")
    expect(result.code).toBe("OK-DUPLICATE")
    expect(result.engineEffect).toBe("NONE")
  })

  it("T-022 repeated validation remains admissible-not-admitted", () => {
    const once = validate(observed(), "H-001").state
    const result = validate(once, "H-001")
    expect(result.code).toBe("OK-VALID")
    expect(result.engineEffect).toBe("NONE")
    expect(result.state.state).toBe("ADMISSIBLE_NOT_ADMITTED")
  })

  it("T-023 supersession creates a new packet while preserving the original", () => {
    const first = emitted()
    const result = emitHandoff(
      first,
      source({ consequenceEvidence: ["consequence:corrected"] }),
      "H-023-B",
      "2026-10-05T12:05:00Z",
      "H-001",
    )
    expect(result.code).toBe("OK-HANDOFF")
    expect(result.state.packets["H-001"]).toBeDefined()
    expect(result.state.packets["H-023-B"].supersedesId).toBe("H-001")
  })

  it("T-024 identical ordered operations replay to identical machine state", () => {
    const run = (): InterfaceRuntimeState => {
      let state = emitted()
      state = observe(state, "H-001").state
      state = validate(state, "H-001").state
      state = admit(state, {
        authorityRef: "AUTH-001",
        authorityStatus: "VALID",
        operationId: "OP-024",
        commitOutcome: "COMMIT",
      }).state
      state = bindSeed(state, "SEED-024").state
      state = evaluateRoute(state).state
      state = commitRoute(state, "ROUTE-024").state
      return state
    }

    expect(run()).toEqual(run())
  })
})

describe("implementation invariants", () => {
  it("keeps source mutation NONE and packet distinct from seed", () => {
    const state = emitted()
    const packet: HandoffPacket = state.packets["H-001"]
    expect(packet.sourceMutation).toBe("NONE")
    expect("seedId" in packet).toBe(false)
  })
})
