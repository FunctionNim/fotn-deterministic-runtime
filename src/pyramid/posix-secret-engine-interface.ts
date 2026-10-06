import { createHash } from "node:crypto"

export type AccountabilityState = "ACCOUNTABLE" | "PARTIALLY_ACCOUNTABLE"
export type ReturnEligibility = "ELIGIBLE" | "NOT_ELIGIBLE" | "HELD" | "UNKNOWN"
export type InterfaceState =
  | "NO_PACKET"
  | "HANDOFF_EMITTED"
  | "OBSERVED"
  | "ADMISSIBLE_NOT_ADMITTED"
  | "ADMITTED"
  | "UNKNOWN_OUTCOME"
  | "SEED_BOUND"
  | "ROUTE_ELIGIBLE"
  | "ROUTED"
  | "HOLD"
  | "DENIED"
  | "CONFLICT"
  | "REFUSED"

export type MachineCode =
  | "OK-HANDOFF"
  | "OK-OBSERVED"
  | "OK-VALID"
  | "OK-DUPLICATE"
  | "OK-ADMITTED"
  | "OK-ALREADY-COMMITTED"
  | "OK-SEED-BOUND"
  | "OK-ROUTE-ELIGIBLE"
  | "OK-ROUTED"
  | "OK-SUPERSEDED"
  | "NO-HANDOFF"
  | "HOLD-MISSING-FIELD"
  | "HOLD-UNSUPPORTED-SCHEMA"
  | "HOLD-UNRESOLVED-SOURCE"
  | "HOLD-BLOCKING-CONTRADICTION"
  | "HOLD-AUTHORITY-UNKNOWN"
  | "HOLD-OPERATION-UNKNOWN"
  | "CONFLICT-ID-BODY"
  | "CONFLICT-SOURCE-MISMATCH"
  | "DENY-NOT-ACCOUNTABLE"
  | "DENY-NO-AUTHORITY"
  | "DENY-AUTHORITY-INVALID"
  | "DENY-PRECONDITION"
  | "REFUSE-SOURCE-MUTATION"
  | "REFUSE-AGENTIVE-NOTHING"
  | "REFUSE-AUTO-ADMIT"
  | "REFUSE-AUTO-ROUTE"
  | "INVALID-FINGERPRINT"

export interface ContradictionRef {
  ref: string
  blocking: boolean
}

export interface PositionIXSource {
  sourcePositionIxId: string
  sourceRefs: string[]
  accountabilityState: AccountabilityState | "UNKNOWN" | "PRE_ROUTE"
  consequenceEvidence: string[]
  unresolvedFields: string[]
  contradictions: ContradictionRef[]
  qualificationOutcome: string
  returnEligibility: ReturnEligibility
  boundaries: string[]
  ancestry: string[]
  nextLawfulEdge: string
  occurredAt?: string | "UNKNOWN"
}

export interface HandoffPacket {
  handoffId: string
  schemaVersion: "POSIX-SE-HANDOFF-1.0"
  handoffType: "ACCOUNTABLE_CONSEQUENCE"
  sourcePositionIxId: string
  sourceRefs: string[]
  accountabilityState: AccountabilityState
  consequenceEvidence: string[]
  unresolvedFields: string[]
  contradictions: ContradictionRef[]
  qualificationOutcome: string
  returnEligibility: ReturnEligibility
  boundaries: string[]
  ancestry: string[]
  nextLawfulEdge: string
  occurredAt?: string | "UNKNOWN"
  observedAt: string
  supersedesId?: string
  semanticFingerprint: string
  sourceMutation: "NONE"
}

export interface AdmissionReceipt {
  operationId: string
  handoffId: string
  admissionAuthorityRef?: string
  decision: "COMMITTED" | "NOT_COMMITTED" | "UNKNOWN"
  committedEventId?: string
  stateBeforeRef?: string
  stateAfterRef?: string
}

export interface InterfaceRuntimeState {
  state: InterfaceState
  packets: Record<string, HandoffPacket>
  activeHandoffId?: string
  admissionReceipts: Record<string, AdmissionReceipt>
  seedId?: string
  routeId?: string
}

export interface OperationResult {
  code: MachineCode
  state: InterfaceRuntimeState
  engineEffect: "NONE" | "ENGINE_LOCAL"
  receipt?: AdmissionReceipt
}

export interface AdmissionContext {
  authorityRef?: string
  authorityStatus: "VALID" | "INVALID" | "UNKNOWN"
  operationId: string
  commitOutcome: "COMMIT" | "NOT_COMMIT" | "UNKNOWN"
}

function canonicalize(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value)
  if (Array.isArray(value)) return "[" + value.map(canonicalize).join(",") + "]"
  const obj = value as Record<string, unknown>
  return "{" + Object.keys(obj).sort().map(key => JSON.stringify(key) + ":" + canonicalize(obj[key])).join(",") + "}"
}

function semanticBody(packet: Omit<HandoffPacket, "semanticFingerprint">): unknown {
  const { observedAt: _observedAt, ...semantic } = packet
  return semantic
}

export function semanticFingerprint(packet: Omit<HandoffPacket, "semanticFingerprint">): string {
  return createHash("sha256").update(canonicalize(semanticBody(packet))).digest("hex")
}

export function createInterfaceState(): InterfaceRuntimeState {
  return {
    state: "NO_PACKET",
    packets: {},
    admissionReceipts: {},
  }
}

export function emitHandoff(
  state: InterfaceRuntimeState,
  source: PositionIXSource,
  handoffId: string,
  observedAt: string,
  supersedesId?: string,
): OperationResult {
  if (!handoffId.trim()) {
    return { code: "HOLD-MISSING-FIELD", state: { ...state, state: "HOLD" }, engineEffect: "NONE" }
  }
  if (source.accountabilityState === "PRE_ROUTE") {
    return { code: "NO-HANDOFF", state, engineEffect: "NONE" }
  }
  if (source.accountabilityState === "UNKNOWN") {
    return { code: "DENY-NOT-ACCOUNTABLE", state, engineEffect: "NONE" }
  }

  const base: Omit<HandoffPacket, "semanticFingerprint"> = {
    handoffId,
    schemaVersion: "POSIX-SE-HANDOFF-1.0",
    handoffType: "ACCOUNTABLE_CONSEQUENCE",
    sourcePositionIxId: source.sourcePositionIxId,
    sourceRefs: [...source.sourceRefs],
    accountabilityState: source.accountabilityState,
    consequenceEvidence: [...source.consequenceEvidence],
    unresolvedFields: [...source.unresolvedFields],
    contradictions: source.contradictions.map(c => ({ ...c })),
    qualificationOutcome: source.qualificationOutcome,
    returnEligibility: source.returnEligibility,
    boundaries: [...source.boundaries],
    ancestry: [...source.ancestry],
    nextLawfulEdge: source.nextLawfulEdge,
    occurredAt: source.occurredAt,
    observedAt,
    supersedesId,
    sourceMutation: "NONE",
  }
  const packet: HandoffPacket = { ...base, semanticFingerprint: semanticFingerprint(base) }
  const existing = state.packets[handoffId]
  if (existing) {
    if (existing.semanticFingerprint === packet.semanticFingerprint) {
      return { code: "OK-DUPLICATE", state, engineEffect: "NONE" }
    }
    return { code: "CONFLICT-ID-BODY", state: { ...state, state: "CONFLICT" }, engineEffect: "NONE" }
  }

  return {
    code: "OK-HANDOFF",
    engineEffect: "NONE",
    state: {
      ...state,
      state: "HANDOFF_EMITTED",
      activeHandoffId: handoffId,
      packets: { ...state.packets, [handoffId]: packet },
    },
  }
}

export function observe(state: InterfaceRuntimeState, handoffId: string): OperationResult {
  const packet = state.packets[handoffId]
  if (!packet) return { code: "HOLD-UNRESOLVED-SOURCE", state: { ...state, state: "HOLD" }, engineEffect: "NONE" }
  return {
    code: state.state === "OBSERVED" && state.activeHandoffId === handoffId ? "OK-DUPLICATE" : "OK-OBSERVED",
    state: { ...state, state: "OBSERVED", activeHandoffId: handoffId },
    engineEffect: "NONE",
  }
}

function hasAgentiveNothing(packet: HandoffPacket): boolean {
  const text = [
    packet.qualificationOutcome,
    packet.nextLawfulEdge,
    ...packet.boundaries,
    ...packet.unresolvedFields,
  ].join(" ").toLowerCase()
  return /(the nothing (chose|chooses|decided|decides|admitted|admits|judged|judges|wanted|wants|commanded|commands|asked|asks))/.test(text)
}

function commandsAdmission(nextLawfulEdge: string): boolean {
  const normalized = nextLawfulEdge.trim().toLowerCase().replace(/[_-]+/g, " ")
  return /\b(auto admit|admit now|admission required|admission command|bind seed now|create seed now|route commit now)\b/.test(normalized)
}

export function validate(state: InterfaceRuntimeState, handoffId: string): OperationResult {
  const packet = state.packets[handoffId]
  if (!packet) return { code: "HOLD-UNRESOLVED-SOURCE", state: { ...state, state: "HOLD" }, engineEffect: "NONE" }
  if (!packet.handoffId.trim()) {
    return { code: "HOLD-MISSING-FIELD", state: { ...state, state: "HOLD" }, engineEffect: "NONE" }
  }
  if (packet.schemaVersion !== "POSIX-SE-HANDOFF-1.0") {
    return { code: "HOLD-UNSUPPORTED-SCHEMA", state: { ...state, state: "HOLD" }, engineEffect: "NONE" }
  }
  if (packet.handoffType !== "ACCOUNTABLE_CONSEQUENCE") {
    return { code: "DENY-PRECONDITION", state: { ...state, state: "DENIED" }, engineEffect: "NONE" }
  }
  if (!packet.sourcePositionIxId || packet.sourceRefs.length === 0 || packet.consequenceEvidence.length === 0 ||
      packet.boundaries.length === 0 || packet.ancestry.length === 0) {
    return { code: "HOLD-MISSING-FIELD", state: { ...state, state: "HOLD" }, engineEffect: "NONE" }
  }
  if (commandsAdmission(packet.nextLawfulEdge)) {
    return { code: "REFUSE-AUTO-ADMIT", state: { ...state, state: "REFUSED" }, engineEffect: "NONE" }
  }
  if (packet.supersedesId === packet.handoffId) {
    return { code: "CONFLICT-ID-BODY", state: { ...state, state: "CONFLICT" }, engineEffect: "NONE" }
  }
  if (packet.supersedesId && !state.packets[packet.supersedesId]) {
    return { code: "CONFLICT-SOURCE-MISMATCH", state: { ...state, state: "CONFLICT" }, engineEffect: "NONE" }
  }
  const { semanticFingerprint: fingerprint, ...base } = packet
  if (semanticFingerprint(base) !== fingerprint) {
    return { code: "INVALID-FINGERPRINT", state: { ...state, state: "HOLD" }, engineEffect: "NONE" }
  }
  if (hasAgentiveNothing(packet)) {
    return { code: "REFUSE-AGENTIVE-NOTHING", state: { ...state, state: "REFUSED" }, engineEffect: "NONE" }
  }
  if (packet.contradictions.some(c => c.blocking)) {
    return { code: "HOLD-BLOCKING-CONTRADICTION", state: { ...state, state: "HOLD" }, engineEffect: "NONE" }
  }
  return {
    code: "OK-VALID",
    state: { ...state, state: "ADMISSIBLE_NOT_ADMITTED", activeHandoffId: handoffId },
    engineEffect: "NONE",
  }
}

export function admit(state: InterfaceRuntimeState, context: AdmissionContext): OperationResult {
  const existing = state.admissionReceipts[context.operationId]
  if (existing?.decision === "COMMITTED") {
    return { code: "OK-ALREADY-COMMITTED", state, engineEffect: "NONE", receipt: existing }
  }
  if (state.state !== "ADMISSIBLE_NOT_ADMITTED" || !state.activeHandoffId) {
    return { code: "DENY-PRECONDITION", state: { ...state, state: "DENIED" }, engineEffect: "NONE" }
  }
  if (!context.authorityRef) {
    return { code: "DENY-NO-AUTHORITY", state: { ...state, state: "DENIED" }, engineEffect: "NONE" }
  }
  if (context.authorityStatus === "UNKNOWN") {
    return { code: "HOLD-AUTHORITY-UNKNOWN", state: { ...state, state: "HOLD" }, engineEffect: "NONE" }
  }
  if (context.authorityStatus === "INVALID") {
    return { code: "DENY-AUTHORITY-INVALID", state: { ...state, state: "DENIED" }, engineEffect: "NONE" }
  }

  const receipt: AdmissionReceipt = {
    operationId: context.operationId,
    handoffId: state.activeHandoffId,
    admissionAuthorityRef: context.authorityRef,
    decision: context.commitOutcome === "COMMIT" ? "COMMITTED" : context.commitOutcome === "NOT_COMMIT" ? "NOT_COMMITTED" : "UNKNOWN",
    committedEventId: context.commitOutcome === "COMMIT" ? `posix-admit:${context.operationId}` : undefined,
    stateBeforeRef: context.commitOutcome === "COMMIT" ? "ADMISSIBLE_NOT_ADMITTED" : undefined,
    stateAfterRef: context.commitOutcome === "COMMIT" ? "ADMITTED" : undefined,
  }

  const nextReceipts = { ...state.admissionReceipts, [context.operationId]: receipt }
  if (receipt.decision === "COMMITTED") {
    return {
      code: "OK-ADMITTED",
      state: { ...state, state: "ADMITTED", admissionReceipts: nextReceipts },
      engineEffect: "ENGINE_LOCAL",
      receipt,
    }
  }
  if (receipt.decision === "UNKNOWN") {
    return {
      code: "HOLD-OPERATION-UNKNOWN",
      state: { ...state, state: "UNKNOWN_OUTCOME", admissionReceipts: nextReceipts },
      engineEffect: "NONE",
      receipt,
    }
  }
  return {
    code: "DENY-PRECONDITION",
    state: { ...state, state: "ADMISSIBLE_NOT_ADMITTED", admissionReceipts: nextReceipts },
    engineEffect: "NONE",
    receipt,
  }
}

export function reconcile(
  state: InterfaceRuntimeState,
  operationId: string,
  authoritativeDecision: "COMMITTED" | "NOT_COMMITTED" | "UNKNOWN",
): OperationResult {
  const prior = state.admissionReceipts[operationId]
  if (!prior) return { code: "HOLD-OPERATION-UNKNOWN", state: { ...state, state: "UNKNOWN_OUTCOME" }, engineEffect: "NONE" }
  if (authoritativeDecision === "UNKNOWN") {
    return { code: "HOLD-OPERATION-UNKNOWN", state: { ...state, state: "UNKNOWN_OUTCOME" }, engineEffect: "NONE", receipt: prior }
  }
  const receipt: AdmissionReceipt = {
    ...prior,
    decision: authoritativeDecision,
    committedEventId: authoritativeDecision === "COMMITTED" ? prior.committedEventId ?? `posix-admit:${operationId}` : undefined,
    stateBeforeRef: authoritativeDecision === "COMMITTED" ? prior.stateBeforeRef ?? "ADMISSIBLE_NOT_ADMITTED" : undefined,
    stateAfterRef: authoritativeDecision === "COMMITTED" ? "ADMITTED" : undefined,
  }
  return {
    code: authoritativeDecision === "COMMITTED" ? "OK-ALREADY-COMMITTED" : "OK-VALID",
    state: {
      ...state,
      state: authoritativeDecision === "COMMITTED" ? "ADMITTED" : "ADMISSIBLE_NOT_ADMITTED",
      admissionReceipts: { ...state.admissionReceipts, [operationId]: receipt },
    },
    engineEffect: "NONE",
    receipt,
  }
}

export function bindSeed(state: InterfaceRuntimeState, seedId: string): OperationResult {
  if (state.state !== "ADMITTED") {
    return { code: "DENY-PRECONDITION", state: { ...state, state: "DENIED" }, engineEffect: "NONE" }
  }
  return {
    code: "OK-SEED-BOUND",
    state: { ...state, state: "SEED_BOUND", seedId },
    engineEffect: "ENGINE_LOCAL",
  }
}

export function evaluateRoute(state: InterfaceRuntimeState): OperationResult {
  if (state.state !== "SEED_BOUND" || !state.seedId) {
    return { code: "DENY-PRECONDITION", state: { ...state, state: "DENIED" }, engineEffect: "NONE" }
  }
  return { code: "OK-ROUTE-ELIGIBLE", state: { ...state, state: "ROUTE_ELIGIBLE" }, engineEffect: "NONE" }
}

export function commitRoute(state: InterfaceRuntimeState, routeId: string): OperationResult {
  if (state.state !== "ROUTE_ELIGIBLE" || !state.seedId) {
    return { code: "REFUSE-AUTO-ROUTE", state: { ...state, state: "REFUSED" }, engineEffect: "NONE" }
  }
  return { code: "OK-ROUTED", state: { ...state, state: "ROUTED", routeId }, engineEffect: "ENGINE_LOCAL" }
}

export function refuseSourceMutation(state: InterfaceRuntimeState): OperationResult {
  return { code: "REFUSE-SOURCE-MUTATION", state: { ...state, state: "REFUSED" }, engineEffect: "NONE" }
}

export function clonePacketWith(
  packet: HandoffPacket,
  changes: Partial<Omit<HandoffPacket, "semanticFingerprint">>,
): HandoffPacket {
  const { semanticFingerprint: _fingerprint, ...base } = packet
  const changed = { ...base, ...changes }
  return { ...changed, semanticFingerprint: semanticFingerprint(changed) }
}

export function installPacket(state: InterfaceRuntimeState, packet: HandoffPacket): InterfaceRuntimeState {
  return {
    ...state,
    state: "HANDOFF_EMITTED",
    activeHandoffId: packet.handoffId,
    packets: { ...state.packets, [packet.handoffId]: packet },
  }
}
