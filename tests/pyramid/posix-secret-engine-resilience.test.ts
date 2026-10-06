import { describe, expect, it } from "vitest"
import {
  admit,
  emitHandoff,
  observe,
  reconcile,
  validate,
  validateAdmissionReceipt,
  type AdmissionReceipt,
  type InterfaceRuntimeState,
} from "../../src/pyramid/posix-secret-engine-interface.js"
import {
  canonicalHappyPath,
  createDefaultNonprodFixture,
  resetScenario,
  runNonprodScenario,
  type HarnessCommand,
} from "../../src/pyramid/posix-secret-engine-nonprod-harness.js"
import {
  buildRuntimeSignature,
  verifyRuntimeSignature,
  type RuntimeSignature,
  type RuntimeSignatureInput,
} from "../../src/runtime-signature/runtime-signature.js"

function unknownOutcome(operationId: string): InterfaceRuntimeState {
  return runNonprodScenario(createDefaultNonprodFixture(), [
    { type: "EMIT_HANDOFF" },
    { type: "OBSERVE" },
    { type: "VALIDATE" },
    { type: "ADMIT", authorityRef: "TEST-AUTH-VALID", operationId, commitOutcome: "UNKNOWN" },
  ]).finalState
}

function routed(operationId: string): InterfaceRuntimeState {
  return runNonprodScenario(createDefaultNonprodFixture(), [
    { type: "EMIT_HANDOFF" },
    { type: "OBSERVE" },
    { type: "VALIDATE" },
    { type: "ADMIT", authorityRef: "TEST-AUTH-VALID", operationId, commitOutcome: "COMMIT" },
    { type: "BIND_SEED", seedId: `TEST-SEED-${operationId}` },
    { type: "EVALUATE_ROUTE" },
    { type: "COMMIT_ROUTE", routeId: `TEST-ROUTE-${operationId}` },
  ]).finalState
}

function withReceipt(
  state: InterfaceRuntimeState,
  operationId: string,
  receipt: AdmissionReceipt,
): InterfaceRuntimeState {
  return {
    ...state,
    admissionReceipts: { ...state.admissionReceipts, [operationId]: receipt },
  }
}

const signatureInput: RuntimeSignatureInput = {
  scenarioId: "TEST-SIGNATURE-RF",
  initialState: { state: "NO_PACKET", packets: 0 },
  orderedActions: [
    { label: "EMIT_HANDOFF:OK-HANDOFF", index: 0 },
    { label: "VALIDATE:OK-VALID", index: 1 },
  ],
  finalState: { state: "ADMISSIBLE_NOT_ADMITTED", packets: 1 },
  auditTrail: [
    "0|EMIT_HANDOFF|OK-HANDOFF|NONE|NO_PACKET|HANDOFF_EMITTED",
    "1|VALIDATE|OK-VALID|NONE|OBSERVED|ADMISSIBLE_NOT_ADMITTED",
  ],
  memoryIds: null,
}

describe("POSITION IX → Secret Engine resilience / fault-injection RF-001..RF-020", () => {
  it("RF-001 rejects a receipt missing operationId", () => {
    const operationId = "TEST-OP-RF001"
    const state = unknownOutcome(operationId)
    const corrupted = withReceipt(state, operationId, {
      ...state.admissionReceipts[operationId],
      operationId: "",
    })
    const result = reconcile(corrupted, operationId, "COMMITTED")
    expect(validateAdmissionReceipt(corrupted, operationId, corrupted.admissionReceipts[operationId])).toBe(false)
    expect(result.code).toBe("INVALID-RECEIPT")
    expect(result.engineEffect).toBe("NONE")
    expect(result.state).toEqual(corrupted)
  })

  it("RF-002 rejects a receipt whose handoffId is not the active known handoff", () => {
    const operationId = "TEST-OP-RF002"
    const state = unknownOutcome(operationId)
    const corrupted = withReceipt(state, operationId, {
      ...state.admissionReceipts[operationId],
      handoffId: "TEST-HANDOFF-NOT-PRESENT",
    })
    const result = reconcile(corrupted, operationId, "COMMITTED")
    expect(result.code).toBe("INVALID-RECEIPT")
    expect(result.engineEffect).toBe("NONE")
    expect(result.state).toEqual(corrupted)
  })

  it("RF-003 rejects a COMMITTED receipt missing committedEventId", () => {
    const operationId = "TEST-OP-RF003"
    const state = routed(operationId)
    const corrupted = withReceipt(state, operationId, {
      ...state.admissionReceipts[operationId],
      committedEventId: undefined,
    })
    const result = reconcile(corrupted, operationId, "COMMITTED")
    expect(result.code).toBe("INVALID-RECEIPT")
    expect(result.engineEffect).toBe("NONE")
    expect(result.state).toEqual(corrupted)
  })

  it("RF-004 rejects a COMMITTED receipt with invalid state refs", () => {
    const operationId = "TEST-OP-RF004"
    const state = routed(operationId)
    const corrupted = withReceipt(state, operationId, {
      ...state.admissionReceipts[operationId],
      stateBeforeRef: "BROKEN_STATE",
      stateAfterRef: "BROKEN_STATE",
    })
    const result = reconcile(corrupted, operationId, "COMMITTED")
    expect(result.code).toBe("INVALID-RECEIPT")
    expect(result.engineEffect).toBe("NONE")
    expect(result.state).toEqual(corrupted)
  })

  it("RF-005 interrupted reconciliation remains UNKNOWN_OUTCOME", () => {
    const operationId = "TEST-OP-RF005"
    const state = unknownOutcome(operationId)
    const result = reconcile(state, operationId, "UNKNOWN")
    expect(result.code).toBe("HOLD-OPERATION-UNKNOWN")
    expect(result.engineEffect).toBe("NONE")
    expect(result.state.state).toBe("UNKNOWN_OUTCOME")
    expect(result.receipt?.decision).toBe("UNKNOWN")
  })

  it("RF-006 cannot downgrade a COMMITTED receipt to NOT_COMMITTED", () => {
    const operationId = "TEST-OP-RF006"
    const state = routed(operationId)
    const result = reconcile(state, operationId, "NOT_COMMITTED")
    expect(result.code).toBe("OK-ALREADY-COMMITTED")
    expect(result.engineEffect).toBe("NONE")
    expect(result.state).toEqual(state)
    expect(result.receipt?.decision).toBe("COMMITTED")
  })

  it("RF-007 cannot downgrade a COMMITTED receipt to UNKNOWN", () => {
    const operationId = "TEST-OP-RF007"
    const state = routed(operationId)
    const result = reconcile(state, operationId, "UNKNOWN")
    expect(result.code).toBe("OK-ALREADY-COMMITTED")
    expect(result.engineEffect).toBe("NONE")
    expect(result.state).toEqual(state)
    expect(result.receipt?.decision).toBe("COMMITTED")
  })

  it("RF-008 duplicate EMIT burst converges on one packet", () => {
    const result = runNonprodScenario(createDefaultNonprodFixture(), [
      { type: "EMIT_HANDOFF" },
      { type: "EMIT_HANDOFF" },
      { type: "EMIT_HANDOFF" },
      { type: "EMIT_HANDOFF" },
    ])
    expect(result.receipts.map(r => r.code)).toEqual([
      "OK-HANDOFF",
      "OK-DUPLICATE",
      "OK-DUPLICATE",
      "OK-DUPLICATE",
    ])
    expect(Object.keys(result.finalState.packets)).toHaveLength(1)
  })

  it("RF-009 stale OBSERVE after ROUTED is repeat-safe and cannot rewind state", () => {
    const operationId = "TEST-OP-RF009"
    const state = routed(operationId)
    const result = observe(state, "TEST-HANDOFF-001")
    expect(result.code).toBe("OK-DUPLICATE")
    expect(result.engineEffect).toBe("NONE")
    expect(result.state).toEqual(state)
    expect(result.state.state).toBe("ROUTED")
  })

  it("RF-010 stale VALIDATE after ROUTED is valid but cannot rewind state", () => {
    const operationId = "TEST-OP-RF010"
    const state = routed(operationId)
    const result = validate(state, "TEST-HANDOFF-001")
    expect(result.code).toBe("OK-VALID")
    expect(result.engineEffect).toBe("NONE")
    expect(result.state).toEqual(state)
    expect(result.state.state).toBe("ROUTED")
  })

  it("RF-011 repeated committed ADMIT burst creates no second mutation", () => {
    const operationId = "TEST-OP-RF011"
    const state = routed(operationId)
    let current = state
    for (let i = 0; i < 5; i += 1) {
      const result = admit(current, {
        authorityRef: "TEST-AUTH-VALID",
        authorityStatus: "VALID",
        operationId,
        commitOutcome: "COMMIT",
      })
      expect(result.code).toBe("OK-ALREADY-COMMITTED")
      expect(result.engineEffect).toBe("NONE")
      expect(result.state).toEqual(state)
      current = result.state
    }
    expect(Object.keys(current.admissionReceipts)).toEqual([operationId])
  })

  it("RF-012 stale same-body packet after route is a no-op and preserves ROUTED", () => {
    const fixture = createDefaultNonprodFixture()
    const state = routed("TEST-OP-RF012")
    const result = emitHandoff(state, fixture.source, fixture.handoffId, fixture.observedAt)
    expect(result.code).toBe("OK-DUPLICATE")
    expect(result.engineEffect).toBe("NONE")
    expect(result.state).toEqual(state)
    expect(result.state.state).toBe("ROUTED")
  })

  it("RF-013 stale changed-body same ID conflicts without overwriting original packet", () => {
    const fixture = createDefaultNonprodFixture()
    const state = routed("TEST-OP-RF013")
    const original = structuredClone(state.packets[fixture.handoffId])
    const result = emitHandoff(
      state,
      { ...fixture.source, consequenceEvidence: ["TEST-CONSEQUENCE-STALE-CONFLICT"] },
      fixture.handoffId,
      fixture.observedAt,
    )
    expect(result.code).toBe("CONFLICT-ID-BODY")
    expect(result.engineEffect).toBe("NONE")
    expect(result.state.state).toBe("CONFLICT")
    expect(result.state.packets[fixture.handoffId]).toEqual(original)
  })

  it("RF-014 reset during UNKNOWN_OUTCOME starts a clean scenario but does not rewrite prior evidence", () => {
    const operationId = "TEST-OP-RF014"
    const state = unknownOutcome(operationId)
    const priorReceipt = structuredClone(state.admissionReceipts[operationId])
    const reset = resetScenario()
    expect(state.state).toBe("UNKNOWN_OUTCOME")
    expect(priorReceipt.decision).toBe("UNKNOWN")
    expect(reset.state).toBe("NO_PACKET")
    expect(reset.admissionReceipts).toEqual({})
    expect(priorReceipt).toEqual(state.admissionReceipts[operationId])
  })

  it("RF-015 reconcile after reset without restoring prior receipt remains unresolved", () => {
    const reset = resetScenario()
    const result = reconcile(reset, "TEST-OP-RF015", "COMMITTED")
    expect(result.code).toBe("HOLD-OPERATION-UNKNOWN")
    expect(result.engineEffect).toBe("NONE")
    expect(result.state.state).toBe("UNKNOWN_OUTCOME")
    expect(result.state.admissionReceipts).toEqual({})
  })

  it("RF-016 detects a tampered claimed combinedHash", () => {
    const claimed = buildRuntimeSignature(signatureInput)
    const tampered = { ...claimed, combinedHash: "deadbeef" } as RuntimeSignature
    expect(verifyRuntimeSignature(signatureInput, tampered)).toBe(false)
  })

  it("RF-017 detects a tampered claimed finalStateHash", () => {
    const claimed = buildRuntimeSignature(signatureInput)
    const tampered = { ...claimed, finalStateHash: "deadbeef" } as RuntimeSignature
    expect(verifyRuntimeSignature(signatureInput, tampered)).toBe(false)
  })

  it("RF-018 detects changed canonical final state under an old claimed signature", () => {
    const claimed = buildRuntimeSignature(signatureInput)
    const changedInput: RuntimeSignatureInput = {
      ...signatureInput,
      finalState: { state: "ROUTED", packets: 1 },
    }
    expect(verifyRuntimeSignature(changedInput, claimed)).toBe(false)
  })

  it("RF-019 detects ordered action or audit-order tampering", () => {
    const claimed = buildRuntimeSignature(signatureInput)
    const changedActions: RuntimeSignatureInput = {
      ...signatureInput,
      orderedActions: [...signatureInput.orderedActions].reverse(),
    }
    const changedAudit: RuntimeSignatureInput = {
      ...signatureInput,
      auditTrail: [...signatureInput.auditTrail].reverse(),
    }
    expect(verifyRuntimeSignature(changedActions, claimed)).toBe(false)
    expect(verifyRuntimeSignature(changedAudit, claimed)).toBe(false)
  })

  it("RF-020 accepts untampered canonical signature evidence", () => {
    const claimed = buildRuntimeSignature(signatureInput)
    expect(verifyRuntimeSignature(signatureInput, claimed)).toBe(true)
  })
})

describe("resilience boundary invariants", () => {
  it("stale read-side burst after a completed route remains monotonic", () => {
    const state = routed("TEST-OP-RF-BURST")
    const observed = observe(state, "TEST-HANDOFF-001")
    const validated = validate(observed.state, "TEST-HANDOFF-001")
    expect(observed.state).toEqual(state)
    expect(validated.state).toEqual(state)
  })

  it("receipt integrity accepts canonical UNKNOWN and COMMITTED receipts", () => {
    const unknownOperation = "TEST-OP-RF-VALID-UNKNOWN"
    const unknown = unknownOutcome(unknownOperation)
    expect(validateAdmissionReceipt(
      unknown,
      unknownOperation,
      unknown.admissionReceipts[unknownOperation],
    )).toBe(true)

    const committedOperation = "TEST-OP-RF-VALID-COMMITTED"
    const committed = routed(committedOperation)
    expect(validateAdmissionReceipt(
      committed,
      committedOperation,
      committed.admissionReceipts[committedOperation],
    )).toBe(true)
  })
})
