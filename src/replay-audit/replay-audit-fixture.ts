/**
 * R15 — Replay Audit Fixture
 *
 * Makes replay audit behaviour a first-class deterministic regression fixture.
 *
 * R12 proved replay works.
 * R13 made signatures canonical.
 * R14 centralised scenarios.
 * R15 proves that audit trails themselves are stable, inspectable, and
 * regression-protected.  All data flows through the Scenario Registry so
 * there are no scattered imports.
 *
 * Doctrine: Pressure → Function → Consequence → Audit → Meaning
 */

import {
  runScenario,
  lookupScenario,
  getAllScenarioIds,
} from '../scenario-registry/scenario-registry.js';

// ─── Types ─────────────────────────────────────────────────────────────────────

/**
 * Structured audit facts extracted from one replay scenario.
 *
 * All fields are derived from structured runtime data only — never from
 * console output, timestamps, or execution environment.  Two calls to
 * buildAuditFixture with the same id must return identical records.
 */
export interface AuditFixture {
  /** Stable scenario identifier — matches the registry key. */
  readonly scenarioId: string;
  /** Total number of entries in the ordered audit trail. */
  readonly auditEventCount: number;
  /** Ordered audit trail — the full sequence of audit events as recorded. */
  readonly auditEvents: readonly string[];
  /**
   * Sorted set of unique audit-event labels.
   * Useful for asserting which event kinds appear without caring about order.
   */
  readonly auditEventTypes: readonly string[];
  /** First event in the audit trail, or null if the trail is empty. */
  readonly firstAuditEvent: string | null;
  /** Last event in the audit trail, or null if the trail is empty. */
  readonly lastAuditEvent: string | null;
  /**
   * Hash of the ordered audit trail — taken directly from the canonical
   * RuntimeSignature so it is identical to what CI and the golden snapshot check.
   */
  readonly auditHash: string;
  /**
   * Combined hash of all canonical signature fields together.
   * Changes whenever any hash changes (state, input, audit, memory).
   */
  readonly signatureCombinedHash: string;
  /**
   * Structured snapshot of the scenario's final state.
   * Exposed as-is from the ReplayResult for structured assertions.
   */
  readonly finalStateSummary: Readonly<Record<string, unknown>>;
  /**
   * Formal assertion that the audit was produced deterministically.
   * true = identical input always produces this exact fixture.
   */
  readonly deterministicProof: boolean;
}

// ─── Builder ───────────────────────────────────────────────────────────────────

/**
 * Build a fully populated AuditFixture for the scenario identified by `id`.
 *
 * Throws a descriptive error if `id` is not registered (delegated from
 * lookupScenario).  All data flows through the Scenario Registry — no
 * direct scenario imports.
 *
 * Deterministic: two calls with the same id produce identical AuditFixtures.
 */
export function buildAuditFixture(id: string): AuditFixture {
  // Will throw a clear error for unknown IDs — that's the intended contract.
  lookupScenario(id);

  const result = runScenario(id);
  const { auditTrail, finalState, signature } = result;

  const auditEvents: readonly string[] = [...auditTrail];
  const auditEventTypes: readonly string[] = [...new Set(auditTrail)].sort();

  return Object.freeze({
    scenarioId: id,
    auditEventCount: auditTrail.length,
    auditEvents,
    auditEventTypes,
    firstAuditEvent: auditTrail.length > 0 ? auditTrail[0] : null,
    lastAuditEvent: auditTrail.length > 0 ? auditTrail[auditTrail.length - 1] : null,
    auditHash: signature.auditHash,
    signatureCombinedHash: signature.combinedHash,
    finalStateSummary: finalState,
    deterministicProof: signature.deterministicProof,
  });
}

/**
 * Build AuditFixtures for every registered scenario, sorted by scenario ID.
 * Deterministic: the order and contents are identical across runs.
 */
export function getAllAuditFixtures(): readonly AuditFixture[] {
  return getAllScenarioIds().map((id) => buildAuditFixture(id));
}
