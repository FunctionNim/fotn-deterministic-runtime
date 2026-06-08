/**
 * R22 — Turn Phase Persistence Corruption Guard
 *
 * Validates persisted turn phase snapshots before restoration.
 * Rejects corrupted, malformed, missing-field, wrong-version, or tampered
 * snapshots with structured failure results — never throws unhandled errors.
 *
 * Corruption cases covered:
 *   MISSING_SCENARIO_ID       — scenarioId absent or empty
 *   WRONG_SCHEMA_VERSION      — schemaVersion is not 'v1'
 *   MISSING_RUNTIME_SIGNATURE — signature field absent or missing combinedHash
 *   TAMPERED_FINAL_STATE      — finalTurnState absent or missing required fields
 *   PHASE_ORDER_CHANGED       — phaseOrder absent, wrong length, or wrong entries
 *   AUDIT_TRAIL_CHANGED       — auditTrail absent, not an array, or empty
 *
 * Doctrine: Pressure → Function → Consequence → Audit → Meaning
 */

import { djb2 } from '../runtime-signature/runtime-signature.js';
import { PHASE_ORDER } from '../turn-pipeline/turn-pipeline.js';
import type { TurnPersistenceSnapshot } from './turn-persistence.js';
import { restoreTurnSnapshot } from './turn-persistence.js';

// ─── Scenario ID ────────────────────────────────────────────────────────────

/**
 * Stable scenario identifier for the corruption guard fixture.
 * Not registered in the Scenario Registry — corruption results are structured
 * CorruptionFailureResults, not ReplayResults, so they cannot satisfy the
 * registry runner contract.
 */
export const SCENARIO_CORRUPTED_PERSISTED_TURN = 'turn-pipeline:persisted-clean-turn:corrupted';

// ─── Failure codes ───────────────────────────────────────────────────────────

/** Stable machine-readable codes for each class of snapshot corruption. */
export type CorruptionFailureCode =
  | 'MISSING_SCENARIO_ID'
  | 'WRONG_SCHEMA_VERSION'
  | 'MISSING_RUNTIME_SIGNATURE'
  | 'TAMPERED_FINAL_STATE'
  | 'PHASE_ORDER_CHANGED'
  | 'AUDIT_TRAIL_CHANGED';

// ─── Failure result ──────────────────────────────────────────────────────────

/**
 * Structured result returned when guardTurnSnapshot rejects a snapshot.
 *
 * All fields are deterministic: identical corrupt input → identical result on
 * every call.  restoreAllowed is always false — no partial state is returned.
 */
export interface CorruptionFailureResult {
  /** Stable machine-readable code for this class of corruption. */
  readonly failureCode: CorruptionFailureCode;
  /** Human-readable explanation of what failed. */
  readonly failureReason: string;
  /** Field path that was absent, malformed, or tampered. */
  readonly corruptedField: string;
  /** schemaVersion from the snapshot, or null if not present. */
  readonly snapshotVersion: string | null;
  /** scenarioId from the snapshot, or null if not present. */
  readonly snapshotScenarioId: string | null;
  /** Always false — no partial state is ever returned on failure. */
  readonly restoreAllowed: false;
  /**
   * Deterministic djb2 hash of the failure fields.
   * Identical corrupt input → identical failureHash on every call.
   */
  readonly failureHash: string;
}

// ─── Guard result ────────────────────────────────────────────────────────────

/**
 * Discriminated-union result from guardTurnSnapshot.
 *
 * ok: true  → snapshot is fully validated and safely restored.
 * ok: false → snapshot was rejected; failure describes why.
 */
export type CorruptionGuardResult =
  | { readonly ok: true;  readonly snapshot: TurnPersistenceSnapshot }
  | { readonly ok: false; readonly failure: CorruptionFailureResult };

// ─── Internal helpers ────────────────────────────────────────────────────────

function buildFailureHash(
  code: CorruptionFailureCode,
  field: string,
  version: string | null,
  scenarioId: string | null,
): string {
  return djb2([code, field, version ?? 'null', scenarioId ?? 'null'].join('|'));
}

function makeFailure(
  code: CorruptionFailureCode,
  reason: string,
  field: string,
  version: string | null,
  scenarioId: string | null,
): CorruptionGuardResult {
  return {
    ok: false,
    failure: {
      failureCode:       code,
      failureReason:     reason,
      corruptedField:    field,
      snapshotVersion:   version,
      snapshotScenarioId: scenarioId,
      restoreAllowed:    false,
      failureHash:       buildFailureHash(code, field, version, scenarioId),
    },
  };
}

// ─── Guard ───────────────────────────────────────────────────────────────────

/**
 * Validate a JSON string before restoring it as a TurnPersistenceSnapshot.
 *
 * Checks are applied in this order:
 *   1. JSON parseable
 *   2. schemaVersion === 'v1'
 *   3. scenarioId present and non-empty
 *   4. signature present with combinedHash
 *   5. finalTurnState present with resolved field
 *   6. phaseOrder present, correct length, correct entries
 *   7. auditTrail present, is an array, non-empty
 *
 * The first failure found is returned.  No partial state is ever restored.
 *
 * Returns { ok: true, snapshot } when all checks pass, or
 *         { ok: false, failure } when any check fails.
 */
export function guardTurnSnapshot(json: string): CorruptionGuardResult {
  // ── Step 0: JSON parse ────────────────────────────────────────────────────
  let raw: Record<string, unknown>;
  try {
    raw = JSON.parse(json) as Record<string, unknown>;
  } catch {
    return makeFailure(
      'WRONG_SCHEMA_VERSION',
      'Input is not valid JSON — parse failed before schema check',
      'root',
      null,
      null,
    );
  }

  // Extract version and scenarioId early so they can be included in any
  // subsequent failure result regardless of which check fails.
  const version    = typeof raw['schemaVersion'] === 'string' ? raw['schemaVersion'] : null;
  const scenarioId = (typeof raw['scenarioId'] === 'string' && raw['scenarioId'].length > 0)
    ? raw['scenarioId']
    : null;

  // ── Step 1: WRONG_SCHEMA_VERSION ──────────────────────────────────────────
  if (version !== 'v1') {
    return makeFailure(
      'WRONG_SCHEMA_VERSION',
      `Expected schemaVersion 'v1', got: ${JSON.stringify(raw['schemaVersion'])}`,
      'schemaVersion',
      version,
      scenarioId,
    );
  }

  // ── Step 2: MISSING_SCENARIO_ID ───────────────────────────────────────────
  if (scenarioId === null) {
    return makeFailure(
      'MISSING_SCENARIO_ID',
      'scenarioId is absent or empty — cannot identify which scenario this snapshot belongs to',
      'scenarioId',
      version,
      null,
    );
  }

  // ── Step 3: MISSING_RUNTIME_SIGNATURE ────────────────────────────────────
  const sig = raw['signature'];
  if (sig === null || typeof sig !== 'object' || Array.isArray(sig)) {
    return makeFailure(
      'MISSING_RUNTIME_SIGNATURE',
      'signature field is absent or not an object',
      'signature',
      version,
      scenarioId,
    );
  }
  const sigObj = sig as Record<string, unknown>;
  if (typeof sigObj['combinedHash'] !== 'string' || sigObj['combinedHash'].length === 0) {
    return makeFailure(
      'MISSING_RUNTIME_SIGNATURE',
      'signature.combinedHash is missing or empty — cannot verify snapshot integrity',
      'signature.combinedHash',
      version,
      scenarioId,
    );
  }

  // ── Step 4: TAMPERED_FINAL_STATE ─────────────────────────────────────────
  const fts = raw['finalTurnState'];
  if (fts === null || typeof fts !== 'object' || Array.isArray(fts)) {
    return makeFailure(
      'TAMPERED_FINAL_STATE',
      'finalTurnState field is absent or not an object',
      'finalTurnState',
      version,
      scenarioId,
    );
  }
  const ftsObj = fts as Record<string, unknown>;
  if (typeof ftsObj['resolved'] !== 'boolean') {
    return makeFailure(
      'TAMPERED_FINAL_STATE',
      'finalTurnState.resolved is missing or not a boolean — final state is incomplete',
      'finalTurnState.resolved',
      version,
      scenarioId,
    );
  }

  // ── Step 5: PHASE_ORDER_CHANGED ───────────────────────────────────────────
  const phaseOrder = raw['phaseOrder'];
  if (!Array.isArray(phaseOrder)) {
    return makeFailure(
      'PHASE_ORDER_CHANGED',
      'phaseOrder field is absent or not an array',
      'phaseOrder',
      version,
      scenarioId,
    );
  }
  if (phaseOrder.length !== PHASE_ORDER.length) {
    return makeFailure(
      'PHASE_ORDER_CHANGED',
      `phaseOrder has ${phaseOrder.length} entries; expected ${PHASE_ORDER.length}`,
      'phaseOrder',
      version,
      scenarioId,
    );
  }
  for (let i = 0; i < PHASE_ORDER.length; i++) {
    if ((phaseOrder as unknown[])[i] !== PHASE_ORDER[i]) {
      return makeFailure(
        'PHASE_ORDER_CHANGED',
        `phaseOrder[${i}] is '${(phaseOrder as unknown[])[i]}'; expected '${PHASE_ORDER[i]}'`,
        `phaseOrder[${i}]`,
        version,
        scenarioId,
      );
    }
  }

  // ── Step 6: AUDIT_TRAIL_CHANGED ───────────────────────────────────────────
  const auditTrail = raw['auditTrail'];
  if (!Array.isArray(auditTrail)) {
    return makeFailure(
      'AUDIT_TRAIL_CHANGED',
      'auditTrail field is absent or not an array',
      'auditTrail',
      version,
      scenarioId,
    );
  }
  if ((auditTrail as unknown[]).length === 0) {
    return makeFailure(
      'AUDIT_TRAIL_CHANGED',
      'auditTrail is empty — a valid snapshot must contain at least one audit event',
      'auditTrail',
      version,
      scenarioId,
    );
  }

  // ── All checks passed — restore ───────────────────────────────────────────
  // restoreTurnSnapshot is safe here: we have already confirmed schemaVersion is 'v1'
  // and all required fields are present and well-typed.
  const snapshot = restoreTurnSnapshot(json);
  return { ok: true, snapshot };
}
