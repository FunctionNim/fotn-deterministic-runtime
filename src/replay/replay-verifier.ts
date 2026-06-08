/**
 * R12 — Replay Verification Domain
 *
 * Proves that a known initial state + a known ordered action sequence can be
 * replayed into the same final state, same audit trail, and same deterministic
 * signature on every run.
 *
 * Doctrine: Pressure → Function → Consequence → Audit → Meaning
 */

// ─── Core types ───────────────────────────────────────────────────────────────

/** One labeled step in a replay sequence.  index encodes position. */
export interface ReplayAction {
  readonly label: string;
  readonly index: number;
}

/** Structured, stable representation of a scenario's final state. */
export type ReplayFinalState = Readonly<Record<string, unknown>>;

/** A stable hash + metadata that uniquely identifies a replay outcome. */
export interface ReplaySignature {
  readonly scenarioId: string;
  readonly actionCount: number;
  /** Hash of the final state snapshot (structured, not console output). */
  readonly finalStateHash: string;
  /** Hash of the ordered audit trail. */
  readonly auditTrailHash: string;
  /** Combined hash of final state + audit trail together. */
  readonly combinedHash: string;
}

/** Full result of running one replay scenario. */
export interface ReplayResult {
  readonly scenarioId: string;
  readonly orderedActions: readonly ReplayAction[];
  readonly finalState: ReplayFinalState;
  readonly auditTrail: readonly string[];
  readonly signature: ReplaySignature;
}

// ─── Hashing ──────────────────────────────────────────────────────────────────

/**
 * Stable JSON serialiser — sorts object keys so the output is identical
 * regardless of insertion order.
 */
function stableJson(value: unknown): string {
  return JSON.stringify(value, (_key, val: unknown): unknown => {
    if (val !== null && typeof val === 'object' && !Array.isArray(val)) {
      return Object.fromEntries(
        Object.entries(val as Record<string, unknown>).sort(([a], [b]) =>
          a.localeCompare(b),
        ),
      );
    }
    return val;
  });
}

/**
 * djb2 hash — deterministic, pure, no external dependencies.
 * Returns an 8-char lowercase hex string.
 */
function djb2(s: string): string {
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(h, 33) ^ s.charCodeAt(i)) >>> 0;
  }
  return h.toString(16).padStart(8, '0');
}

/** Hash any value via stable JSON serialisation then djb2. */
export function stableJsonHash(value: unknown): string {
  return djb2(stableJson(value));
}

// ─── Signature builder ────────────────────────────────────────────────────────

export function buildSignature(
  scenarioId: string,
  actions: readonly ReplayAction[],
  finalState: ReplayFinalState,
  auditTrail: readonly string[],
): ReplaySignature {
  const finalStateHash = stableJsonHash(finalState);
  const auditTrailHash = stableJsonHash(auditTrail);
  const combinedHash = djb2(finalStateHash + '|' + auditTrailHash + '|' + scenarioId);
  return {
    scenarioId,
    actionCount: actions.length,
    finalStateHash,
    auditTrailHash,
    combinedHash,
  };
}

// ─── Scenario factory helper ───────────────────────────────────────────────────

export function assembleResult(
  scenarioId: string,
  orderedActions: readonly ReplayAction[],
  finalState: ReplayFinalState,
  auditTrail: readonly string[],
): ReplayResult {
  return {
    scenarioId,
    orderedActions,
    finalState,
    auditTrail,
    signature: buildSignature(scenarioId, orderedActions, finalState, auditTrail),
  };
}
