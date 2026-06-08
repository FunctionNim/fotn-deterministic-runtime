/**
 * R13 — Runtime Signature System
 *
 * Canonical, reusable deterministic signature module.
 *
 * All scenarios, fixtures, snapshots, replay verification, and CI should
 * compare behaviour through this one signature shape.
 *
 * Doctrine: Pressure → Function → Consequence → Audit → Meaning
 *
 * Properties guaranteed by this module:
 *   - Identical structured input  → identical signature
 *   - Object key order            → does NOT affect any hash
 *   - Array element order         → DOES affect every hash
 *   - No dependency on console formatting
 *   - No external runtime dependencies (pure djb2 + JSON)
 */

// ─── Signature version ────────────────────────────────────────────────────────

export const SIGNATURE_VERSION = 'r13' as const;

// ─── Core types ───────────────────────────────────────────────────────────────

/**
 * Canonical deterministic signature for any runtime scenario.
 *
 * Every field is derived from structured input only — never from console
 * output, timestamp, or execution environment.
 */
export interface RuntimeSignature {
  /** Identifies the schema version.  Always 'r13' for signatures built by this module. */
  readonly signatureVersion: typeof SIGNATURE_VERSION;
  /** Stable identifier for the scenario or fixture being signed. */
  readonly scenarioId: string;
  /** Number of ordered input events / actions. */
  readonly actionCount: number;
  /** Hash of the structured initial state (key-order-independent). */
  readonly initialStateHash: string;
  /** Hash of the ordered input event / action sequence (order-sensitive). */
  readonly inputHash: string;
  /** Hash of the structured final state (key-order-independent). */
  readonly finalStateHash: string;
  /** Hash of the ordered audit trail (order-sensitive). */
  readonly auditHash: string;
  /** Hash of persisted memory IDs, or null when the scenario has no memory layer. */
  readonly memoryHash: string | null;
  /**
   * Formal assertion that the output was produced deterministically.
   * true  = identical input always produces this exact signature.
   * false = the scenario cannot make this guarantee (e.g. uses randomness).
   */
  readonly deterministicProof: boolean;
  /**
   * Combined hash of all canonical fields together.
   * Changes whenever any other hash changes.
   */
  readonly combinedHash: string;
}

/** Input bag for buildRuntimeSignature. */
export interface RuntimeSignatureInput {
  readonly scenarioId: string;
  readonly initialState: Readonly<Record<string, unknown>>;
  readonly orderedActions: ReadonlyArray<{ readonly label: string; readonly index: number }>;
  readonly finalState: Readonly<Record<string, unknown>>;
  readonly auditTrail: readonly string[];
  /** Pass the ordered list of persisted memory IDs, or null / undefined if not applicable. */
  readonly memoryIds?: readonly string[] | null;
  /**
   * Explicitly set to false only if the scenario uses non-deterministic input.
   * Defaults to true.
   */
  readonly deterministicProof?: boolean;
}

// ─── Stable serialisation and hashing ────────────────────────────────────────

/**
 * Stable JSON serialiser — sorts object keys at every nesting level so the
 * output is identical regardless of insertion order.
 * Array element order is preserved.
 */
export function stableJson(value: unknown): string {
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
export function djb2(s: string): string {
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

/**
 * Build a fully populated RuntimeSignature from structured inputs.
 *
 * All hashes are derived from stable JSON (key-order-independent, array-order-
 * sensitive) so the signature is portable across environments and runtimes.
 */
export function buildRuntimeSignature(input: RuntimeSignatureInput): RuntimeSignature {
  const initialStateHash = stableJsonHash(input.initialState);
  const inputHash = stableJsonHash(input.orderedActions);
  const finalStateHash = stableJsonHash(input.finalState);
  const auditHash = stableJsonHash(input.auditTrail);
  const memoryHash =
    input.memoryIds != null ? stableJsonHash(input.memoryIds) : null;

  const combinedHash = djb2(
    [
      SIGNATURE_VERSION,
      input.scenarioId,
      initialStateHash,
      inputHash,
      finalStateHash,
      auditHash,
      memoryHash ?? 'null',
    ].join('|'),
  );

  return {
    signatureVersion: SIGNATURE_VERSION,
    scenarioId: input.scenarioId,
    actionCount: input.orderedActions.length,
    initialStateHash,
    inputHash,
    finalStateHash,
    auditHash,
    memoryHash,
    deterministicProof: input.deterministicProof ?? true,
    combinedHash,
  };
}
