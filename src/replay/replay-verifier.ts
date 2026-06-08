/**
 * R12 — Replay Verification Domain
 * R13 — Refactored to use the shared Runtime Signature System
 *
 * Proves that a known initial state + a known ordered action sequence can be
 * replayed into the same final state, same audit trail, and same deterministic
 * signature on every run.
 *
 * Hashing and signature construction are now provided by the canonical
 * runtime-signature module.  This file re-exports the utilities that external
 * code (e.g. tests) previously imported directly from here.
 *
 * Doctrine: Pressure → Function → Consequence → Audit → Meaning
 */

export {
  stableJsonHash,
  djb2,
  stableJson,
  buildRuntimeSignature,
  RuntimeSignature,
  RuntimeSignatureInput,
  SIGNATURE_VERSION,
} from '../runtime-signature/runtime-signature.js';

import { buildRuntimeSignature, RuntimeSignature } from '../runtime-signature/runtime-signature.js';

// ─── Core types ───────────────────────────────────────────────────────────────

/** One labeled step in a replay sequence.  index encodes position. */
export interface ReplayAction {
  readonly label: string;
  readonly index: number;
}

/** Structured, stable representation of a scenario's initial or final state. */
export type ReplayFinalState = Readonly<Record<string, unknown>>;

/**
 * ReplaySignature is the canonical RuntimeSignature.
 * Re-exported here so existing imports from replay-verifier continue to work.
 */
export type ReplaySignature = RuntimeSignature;

/** Full result of running one replay scenario. */
export interface ReplayResult {
  readonly scenarioId: string;
  readonly orderedActions: readonly ReplayAction[];
  /** Structured snapshot of the world state before any action was applied. */
  readonly initialState: ReplayFinalState;
  readonly finalState: ReplayFinalState;
  readonly auditTrail: readonly string[];
  readonly signature: RuntimeSignature;
}

// ─── Scenario factory helper ───────────────────────────────────────────────────

/**
 * Assemble a ReplayResult from structured scenario data.
 *
 * Delegates signature construction to buildRuntimeSignature so that the
 * runtime-signature module is the single source of truth for all hashing.
 */
export function assembleResult(
  scenarioId: string,
  orderedActions: readonly ReplayAction[],
  initialState: ReplayFinalState,
  finalState: ReplayFinalState,
  auditTrail: readonly string[],
  memoryIds?: readonly string[] | null,
): ReplayResult {
  return {
    scenarioId,
    orderedActions,
    initialState,
    finalState,
    auditTrail,
    signature: buildRuntimeSignature({
      scenarioId,
      initialState,
      orderedActions,
      finalState,
      auditTrail,
      memoryIds,
    }),
  };
}
