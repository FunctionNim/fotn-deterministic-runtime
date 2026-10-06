import {
  admit,
  bindSeed,
  commitRoute,
  createInterfaceState,
  emitHandoff,
  evaluateRoute,
  observe,
  reconcile,
  validate,
  type AdmissionContext,
  type InterfaceRuntimeState,
  type MachineCode,
  type PositionIXSource,
} from "./posix-secret-engine-interface.js"
import { buildRuntimeSignature } from "../runtime-signature/runtime-signature.js"

export const POSIX_SE_NONPROD_HARNESS_001 = Object.freeze({
  harnessId: "POSIX-SE-NONPROD-HARNESS-001",
  executionMode: "NON_PRODUCTION_ISOLATED",
  artifactBaseline: "120d2b1e7abf7726441d3c0e0db522602767fdd6",
  networkMode: "IN_PROCESS_ONLY",
  sourceMutation: "NONE",
} as const)

export type SyntheticAuthorityStatus = "VALID" | "INVALID" | "UNKNOWN"

export interface SyntheticAuthorityRegistry {
  readonly [authorityRef: string]: SyntheticAuthorityStatus
}

export interface HarnessFixture {
  readonly fixtureId: string
  readonly handoffId: string
  readonly observedAt: string
  readonly source: PositionIXSource
  readonly authorityRegistry: SyntheticAuthorityRegistry
}

export type HarnessCommand =
  | { readonly type: "EMIT_HANDOFF" }
  | { readonly type: "OBSERVE" }
  | { readonly type: "VALIDATE" }
  | { readonly type: "ADMIT"; readonly authorityRef: string; readonly operationId: string; readonly commitOutcome: AdmissionContext["commitOutcome"] }
  | { readonly type: "RECONCILE"; readonly operationId: string; readonly authoritativeDecision: "COMMITTED" | "NOT_COMMITTED" | "UNKNOWN" }
  | { readonly type: "BIND_SEED"; readonly seedId: string }
  | { readonly type: "EVALUATE_ROUTE" }
  | { readonly type: "COMMIT_ROUTE"; readonly routeId: string }

export interface HarnessReceipt {
  readonly index: number
  readonly command: HarnessCommand["type"]
  readonly code: MachineCode
  readonly engineEffect: "NONE" | "ENGINE_LOCAL"
  readonly stateBefore: InterfaceRuntimeState["state"]
  readonly stateAfter: InterfaceRuntimeState["state"]
}

export interface HarnessRunResult {
  readonly harnessId: typeof POSIX_SE_NONPROD_HARNESS_001.harnessId
  readonly fixtureId: string
  readonly artifactBaseline: typeof POSIX_SE_NONPROD_HARNESS_001.artifactBaseline
  readonly finalState: InterfaceRuntimeState
  readonly receipts: readonly HarnessReceipt[]
  readonly signature: ReturnType<typeof buildRuntimeSignature>
}

function cloneState(state: InterfaceRuntimeState): InterfaceRuntimeState {
  return structuredClone(state)
}

function assertSyntheticId(value: string, prefix: string, label: string): void {
  if (!value.startsWith(prefix)) {
    throw new Error(`${label} must use synthetic ${prefix} namespace`)
  }
}

function authorityStatus(registry: SyntheticAuthorityRegistry, authorityRef: string): SyntheticAuthorityStatus {
  assertSyntheticId(authorityRef, "TEST-AUTH-", "authorityRef")
  return registry[authorityRef] ?? "UNKNOWN"
}

export function createDefaultNonprodFixture(
  overrides: Partial<HarnessFixture> = {},
): HarnessFixture {
  const base: HarnessFixture = {
    fixtureId: "TEST-FIXTURE-POSIX-001",
    handoffId: "TEST-HANDOFF-001",
    observedAt: "2026-10-06T00:00:00Z",
    source: {
      sourcePositionIxId: "TEST-POSIX-001",
      sourceRefs: ["Pyramid-Talaru:157"],
      accountabilityState: "ACCOUNTABLE",
      consequenceEvidence: ["TEST-CONSEQUENCE-001"],
      unresolvedFields: [],
      contradictions: [],
      qualificationOutcome: "QUALIFIED_FOR_RETURN",
      returnEligibility: "ELIGIBLE",
      boundaries: ["NON_AGENTIVE_NOTHING", "NO_AUTO_ADMISSION", "NON_PRODUCTION_ONLY"],
      ancestry: ["PositionIX", "SecretEnginePreRoutePatch", "Pyramid-Talaru:157"],
      nextLawfulEdge: "SECRET_ENGINE_CONSIDERATION",
      occurredAt: "UNKNOWN",
    },
    authorityRegistry: {
      "TEST-AUTH-VALID": "VALID",
      "TEST-AUTH-INVALID": "INVALID",
      "TEST-AUTH-UNKNOWN": "UNKNOWN",
    },
  }
  return {
    ...base,
    ...overrides,
    source: { ...base.source, ...(overrides.source ?? {}) },
    authorityRegistry: { ...base.authorityRegistry, ...(overrides.authorityRegistry ?? {}) },
  }
}

export function createScenarioState(): InterfaceRuntimeState {
  return createInterfaceState()
}

export function runNonprodScenario(
  fixture: HarnessFixture,
  commands: readonly HarnessCommand[],
): HarnessRunResult {
  assertSyntheticId(fixture.fixtureId, "TEST-FIXTURE-", "fixtureId")
  assertSyntheticId(fixture.handoffId, "TEST-HANDOFF-", "handoffId")
  assertSyntheticId(fixture.source.sourcePositionIxId, "TEST-POSIX-", "sourcePositionIxId")

  let state = createScenarioState()
  const initialState = cloneState(state)
  const receipts: HarnessReceipt[] = []

  commands.forEach((command, index) => {
    const before = cloneState(state)
    let result

    switch (command.type) {
      case "EMIT_HANDOFF":
        result = emitHandoff(state, fixture.source, fixture.handoffId, fixture.observedAt)
        break
      case "OBSERVE":
        result = observe(state, fixture.handoffId)
        break
      case "VALIDATE":
        result = validate(state, fixture.handoffId)
        break
      case "ADMIT": {
        assertSyntheticId(command.operationId, "TEST-OP-", "operationId")
        const status = authorityStatus(fixture.authorityRegistry, command.authorityRef)
        result = admit(state, {
          authorityRef: command.authorityRef,
          authorityStatus: status,
          operationId: command.operationId,
          commitOutcome: command.commitOutcome,
        })
        break
      }
      case "RECONCILE":
        assertSyntheticId(command.operationId, "TEST-OP-", "operationId")
        result = reconcile(state, command.operationId, command.authoritativeDecision)
        break
      case "BIND_SEED":
        assertSyntheticId(command.seedId, "TEST-SEED-", "seedId")
        result = bindSeed(state, command.seedId)
        break
      case "EVALUATE_ROUTE":
        result = evaluateRoute(state)
        break
      case "COMMIT_ROUTE":
        assertSyntheticId(command.routeId, "TEST-ROUTE-", "routeId")
        result = commitRoute(state, command.routeId)
        break
    }

    state = result.state
    receipts.push({
      index,
      command: command.type,
      code: result.code,
      engineEffect: result.engineEffect,
      stateBefore: before.state,
      stateAfter: state.state,
    })
  })

  const orderedActions = receipts.map(receipt => ({ label: `${receipt.command}:${receipt.code}`, index: receipt.index }))
  const auditTrail = receipts.map(receipt =>
    [receipt.index, receipt.command, receipt.code, receipt.engineEffect, receipt.stateBefore, receipt.stateAfter].join("|"),
  )

  const signature = buildRuntimeSignature({
    scenarioId: fixture.fixtureId,
    initialState: initialState as unknown as Readonly<Record<string, unknown>>,
    orderedActions,
    finalState: cloneState(state) as unknown as Readonly<Record<string, unknown>>,
    auditTrail,
    memoryIds: null,
  })

  return {
    harnessId: POSIX_SE_NONPROD_HARNESS_001.harnessId,
    fixtureId: fixture.fixtureId,
    artifactBaseline: POSIX_SE_NONPROD_HARNESS_001.artifactBaseline,
    finalState: cloneState(state),
    receipts,
    signature,
  }
}

export function resetScenario(): InterfaceRuntimeState {
  return createScenarioState()
}

export function canonicalHappyPath(): readonly HarnessCommand[] {
  return [
    { type: "EMIT_HANDOFF" },
    { type: "OBSERVE" },
    { type: "VALIDATE" },
    { type: "ADMIT", authorityRef: "TEST-AUTH-VALID", operationId: "TEST-OP-001", commitOutcome: "COMMIT" },
    { type: "BIND_SEED", seedId: "TEST-SEED-001" },
    { type: "EVALUATE_ROUTE" },
    { type: "COMMIT_ROUTE", routeId: "TEST-ROUTE-001" },
  ]
}
