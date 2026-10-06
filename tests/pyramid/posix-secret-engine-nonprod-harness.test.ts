import { describe, expect, it } from "vitest"
import {
  POSIX_SE_NONPROD_HARNESS_001,
  canonicalHappyPath,
  createDefaultNonprodFixture,
  createScenarioState,
  resetScenario,
  runNonprodScenario,
  type HarnessCommand,
} from "../../src/pyramid/posix-secret-engine-nonprod-harness.js"

describe("POSITION IX → Secret Engine non-production integration harness 001", () => {
  it("NP-001 is in-process-only and bound to the accepted reference artifact", () => {
    expect(POSIX_SE_NONPROD_HARNESS_001.executionMode).toBe("NON_PRODUCTION_ISOLATED")
    expect(POSIX_SE_NONPROD_HARNESS_001.networkMode).toBe("IN_PROCESS_ONLY")
    expect(POSIX_SE_NONPROD_HARNESS_001.artifactBaseline).toBe("120d2b1e7abf7726441d3c0e0db522602767fdd6")
    expect(POSIX_SE_NONPROD_HARNESS_001.sourceMutation).toBe("NONE")
  })

  it("NP-002 runs the synthetic happy path through explicit admission, seed, and route", () => {
    const result = runNonprodScenario(createDefaultNonprodFixture(), canonicalHappyPath())
    expect(result.finalState.state).toBe("ROUTED")
    expect(result.finalState.seedId).toBe("TEST-SEED-001")
    expect(result.finalState.routeId).toBe("TEST-ROUTE-001")
    expect(result.receipts.map(r => r.code)).toEqual([
      "OK-HANDOFF",
      "OK-OBSERVED",
      "OK-VALID",
      "OK-ADMITTED",
      "OK-SEED-BOUND",
      "OK-ROUTE-ELIGIBLE",
      "OK-ROUTED",
    ])
  })

  it("NP-003 observe and validate remain read-side operations with no engine effect", () => {
    const result = runNonprodScenario(createDefaultNonprodFixture(), [
      { type: "EMIT_HANDOFF" },
      { type: "OBSERVE" },
      { type: "VALIDATE" },
    ])
    expect(result.receipts[1].engineEffect).toBe("NONE")
    expect(result.receipts[2].engineEffect).toBe("NONE")
    expect(result.finalState.state).toBe("ADMISSIBLE_NOT_ADMITTED")
  })

  it("NP-004 invalid synthetic authority cannot admit", () => {
    const result = runNonprodScenario(createDefaultNonprodFixture(), [
      { type: "EMIT_HANDOFF" },
      { type: "OBSERVE" },
      { type: "VALIDATE" },
      { type: "ADMIT", authorityRef: "TEST-AUTH-INVALID", operationId: "TEST-OP-004", commitOutcome: "COMMIT" },
    ])
    expect(result.receipts.at(-1)?.code).toBe("DENY-AUTHORITY-INVALID")
    expect(result.receipts.at(-1)?.engineEffect).toBe("NONE")
  })

  it("NP-005 unknown synthetic authority holds without mutation", () => {
    const result = runNonprodScenario(createDefaultNonprodFixture(), [
      { type: "EMIT_HANDOFF" },
      { type: "OBSERVE" },
      { type: "VALIDATE" },
      { type: "ADMIT", authorityRef: "TEST-AUTH-UNKNOWN", operationId: "TEST-OP-005", commitOutcome: "COMMIT" },
    ])
    expect(result.receipts.at(-1)?.code).toBe("HOLD-AUTHORITY-UNKNOWN")
    expect(result.receipts.at(-1)?.engineEffect).toBe("NONE")
  })

  it("NP-006 rejects real/non-synthetic authority namespaces", () => {
    expect(() => runNonprodScenario(createDefaultNonprodFixture(), [
      { type: "EMIT_HANDOFF" },
      { type: "OBSERVE" },
      { type: "VALIDATE" },
      { type: "ADMIT", authorityRef: "OWNER-REAL-AUTH", operationId: "TEST-OP-006", commitOutcome: "COMMIT" },
    ])).toThrow(/synthetic TEST-AUTH-/)
  })

  it("NP-007 rejects non-synthetic source, seed, route, and operation identities", () => {
    expect(() => runNonprodScenario(
      createDefaultNonprodFixture({ source: { sourcePositionIxId: "LIVE-POSIX-001" } }),
      [{ type: "EMIT_HANDOFF" }],
    )).toThrow(/synthetic TEST-POSIX-/)

    const prefix: HarnessCommand[] = [
      { type: "EMIT_HANDOFF" },
      { type: "OBSERVE" },
      { type: "VALIDATE" },
    ]
    expect(() => runNonprodScenario(createDefaultNonprodFixture(), [
      ...prefix,
      { type: "ADMIT", authorityRef: "TEST-AUTH-VALID", operationId: "LIVE-OP-001", commitOutcome: "COMMIT" },
    ])).toThrow(/synthetic TEST-OP-/)

    expect(() => runNonprodScenario(createDefaultNonprodFixture(), [
      ...prefix,
      { type: "ADMIT", authorityRef: "TEST-AUTH-VALID", operationId: "TEST-OP-007", commitOutcome: "COMMIT" },
      { type: "BIND_SEED", seedId: "LIVE-SEED-001" },
    ])).toThrow(/synthetic TEST-SEED-/)
  })

  it("NP-008 two independent scenario runs do not share mutable state", () => {
    const a = runNonprodScenario(createDefaultNonprodFixture(), canonicalHappyPath())
    const b = runNonprodScenario(createDefaultNonprodFixture(), [
      { type: "EMIT_HANDOFF" },
      { type: "OBSERVE" },
    ])
    expect(a.finalState.state).toBe("ROUTED")
    expect(b.finalState.state).toBe("OBSERVED")
    expect(b.finalState.seedId).toBeUndefined()
    expect(b.finalState.routeId).toBeUndefined()
  })

  it("NP-009 reset reconstructs the canonical clean baseline", () => {
    const baseline = createScenarioState()
    const reset = resetScenario()
    expect(reset).toEqual(baseline)
    expect(reset).not.toBe(baseline)
  })

  it("NP-010 identical fixture + commands produce identical receipts, state, and signature", () => {
    const a = runNonprodScenario(createDefaultNonprodFixture(), canonicalHappyPath())
    const b = runNonprodScenario(createDefaultNonprodFixture(), canonicalHappyPath())
    expect(a.receipts).toEqual(b.receipts)
    expect(a.finalState).toEqual(b.finalState)
    expect(a.signature).toEqual(b.signature)
    expect(a.signature.deterministicProof).toBe(true)
  })

  it("NP-011 unknown admission outcome remains held until explicit reconciliation", () => {
    const commands: HarnessCommand[] = [
      { type: "EMIT_HANDOFF" },
      { type: "OBSERVE" },
      { type: "VALIDATE" },
      { type: "ADMIT", authorityRef: "TEST-AUTH-VALID", operationId: "TEST-OP-011", commitOutcome: "UNKNOWN" },
      { type: "RECONCILE", operationId: "TEST-OP-011", authoritativeDecision: "COMMITTED" },
    ]
    const result = runNonprodScenario(createDefaultNonprodFixture(), commands)
    expect(result.receipts[3].code).toBe("HOLD-OPERATION-UNKNOWN")
    expect(result.receipts[3].engineEffect).toBe("NONE")
    expect(result.receipts[4].code).toBe("OK-ALREADY-COMMITTED")
    expect(result.receipts[4].engineEffect).toBe("NONE")
    expect(result.finalState.state).toBe("ADMITTED")
  })

  it("NP-012 validation cannot auto-admit even when a valid authority fixture exists", () => {
    const result = runNonprodScenario(createDefaultNonprodFixture(), [
      { type: "EMIT_HANDOFF" },
      { type: "OBSERVE" },
      { type: "VALIDATE" },
    ])
    expect(result.finalState.state).toBe("ADMISSIBLE_NOT_ADMITTED")
    expect(result.finalState.admissionReceipts).toEqual({})
  })

  it("NP-013 harness evidence is structured and contains no wall-clock dependency", () => {
    const result = runNonprodScenario(createDefaultNonprodFixture(), canonicalHappyPath())
    expect(result.receipts.every((r, index) => r.index === index)).toBe(true)
    expect(result.signature.scenarioId).toBe("TEST-FIXTURE-POSIX-001")
    expect(result.signature.actionCount).toBe(result.receipts.length)
  })
})
