/**
 * R23 — Turn Phase Snapshot Migration Fixture
 *
 * Deterministic migration of persisted turn phase snapshots from older
 * supported versions to the current version.
 *
 * Version table:
 *   v0  — old format (missing phaseOrder, signature, deterministicProof,
 *          finalTurnState.currentPhase, finalTurnState.completedPhaseCount)
 *   v1  — current format (all fields present)
 *
 * Migration paths:
 *   v0 → v1   (supported, migrationApplied: true)
 *   v1 → v1   (identity, migrationApplied: false — already current)
 *
 * Failure codes for unsupported or malformed input:
 *   MISSING_SOURCE_VERSION      — schemaVersion field absent or not a string
 *   UNSUPPORTED_OLD_VERSION     — version string present but not in vN format
 *                                 (pre-dates the versioned scheme)
 *   UNSUPPORTED_FUTURE_VERSION  — vN where N > 1 (newer than current)
 *   MALFORMED_INPUT             — JSON parse failure or required v0 fields missing
 *
 * Doctrine: Pressure → Function → Consequence → Audit → Meaning
 */

import {
  djb2,
  buildRuntimeSignature,
} from '../runtime-signature/runtime-signature.js';
import { PHASE_ORDER } from '../turn-pipeline/turn-pipeline.js';
import type { TurnPersistenceSnapshot } from './turn-persistence.js';
import { restoreTurnSnapshot } from './turn-persistence.js';

// ─── Version constants ────────────────────────────────────────────────────────

/** The current snapshot schema version produced by serializeTurnResult. */
export const CURRENT_SNAPSHOT_VERSION = 'v1' as const;

/** The oldest snapshot version supported for migration. */
export const MINIMUM_SUPPORTED_VERSION = 'v0' as const;

// ─── Scenario ID ─────────────────────────────────────────────────────────────

/**
 * Stable scenario identifier for the v0-migration fixture.
 * Not registered in the Scenario Registry — migration results are structured
 * MigrationResults, not ReplayResults, and cannot satisfy the registry runner
 * contract.
 */
export const SCENARIO_MIGRATED_V0 = 'turn-pipeline:persisted-clean-turn:migrated-v0';

// ─── v0 snapshot shape ───────────────────────────────────────────────────────

/**
 * Raw shape of a v0 snapshot.
 *
 * v0 was a simplified format that lacked phaseOrder, signature,
 * deterministicProof, and the currentPhase / completedPhaseCount fields on
 * finalTurnState.  All missing fields are supplied with safe defaults during
 * migration.
 */
export interface V0TurnSnapshotRaw {
  readonly schemaVersion: 'v0';
  readonly scenarioId: string;
  readonly finalTurnState: {
    readonly turnId: string;
    readonly resolved: boolean;
    readonly pressureLevel: number;
  };
  readonly auditTrail: readonly string[];
}

// ─── Migration steps ─────────────────────────────────────────────────────────

/**
 * Stable ordered migration steps applied during v0 → v1 migration.
 * The list is immutable and identical on every run — it is part of the
 * deterministic migration signature.
 */
export const MIGRATION_STEPS_V0_TO_V1: readonly string[] = Object.freeze([
  'copy scenarioId',
  'copy auditTrail',
  'copy finalTurnState.turnId, resolved, pressureLevel',
  'add finalTurnState.currentPhase (null — unknown in v0)',
  'add finalTurnState.completedPhaseCount (inferred from auditTrail.length)',
  'add phaseOrder (canonical PHASE_ORDER)',
  'add deterministicProof (false — migrated data cannot claim original determinism)',
  'add signature (rebuilt from migrated state)',
]);

// ─── Migration result ─────────────────────────────────────────────────────────

/** Returned when a snapshot is successfully migrated or is already current. */
export interface SnapshotMigrationResult {
  /** Version of the snapshot supplied to migrateSnapshot. */
  readonly sourceVersion: string;
  /** Version of the produced snapshot — always CURRENT_SNAPSHOT_VERSION. */
  readonly targetVersion: typeof CURRENT_SNAPSHOT_VERSION;
  /** Stable scenario identifier from the snapshot. */
  readonly scenarioId: string;
  /** true if a migration path was applied; false if the snapshot was already current. */
  readonly migrationApplied: boolean;
  /**
   * Stable ordered steps applied during migration.
   * Empty when migrationApplied is false (already-current identity migration).
   */
  readonly migrationSteps: readonly string[];
  /** The resulting v1 snapshot, ready for restoreTurnSnapshot. */
  readonly migratedSnapshot: TurnPersistenceSnapshot;
  /**
   * Deterministic djb2 hash of sourceVersion|targetVersion|scenarioId|steps.
   * Identical inputs always produce the identical hash.
   */
  readonly migrationHash: string;
}

// ─── Failure codes ────────────────────────────────────────────────────────────

/** Stable machine-readable codes for each class of migration failure. */
export type MigrationFailureCode =
  | 'MISSING_SOURCE_VERSION'
  | 'UNSUPPORTED_OLD_VERSION'
  | 'UNSUPPORTED_FUTURE_VERSION'
  | 'MALFORMED_INPUT';

// ─── Migration failure result ─────────────────────────────────────────────────

/**
 * Structured result returned when migrateSnapshot cannot process the input.
 *
 * All fields are deterministic: identical bad input → identical result.
 * migrationAllowed is always false — no partial snapshot is returned.
 */
export interface MigrationFailureResult {
  /** Stable machine-readable code for this class of failure. */
  readonly failureCode: MigrationFailureCode;
  /** Human-readable explanation of why migration was refused. */
  readonly failureReason: string;
  /** schemaVersion from the input, or null if not present. */
  readonly sourceVersion: string | null;
  /** Always CURRENT_SNAPSHOT_VERSION. */
  readonly targetVersion: typeof CURRENT_SNAPSHOT_VERSION;
  /** scenarioId from the input, or null if not present or invalid. */
  readonly scenarioId: string | null;
  /** Always false — no partial output is returned on failure. */
  readonly migrationAllowed: false;
  /**
   * Deterministic djb2 hash of failureCode|sourceVersion|scenarioId.
   * Identical inputs always produce the identical hash.
   */
  readonly failureHash: string;
}

// ─── Guard result ─────────────────────────────────────────────────────────────

/**
 * Discriminated-union result from migrateSnapshot.
 *
 * ok: true  → migration succeeded; migratedSnapshot is ready to restore.
 * ok: false → migration refused; failure describes why.
 */
export type MigrationGuardResult =
  | { readonly ok: true;  readonly migration: SnapshotMigrationResult }
  | { readonly ok: false; readonly failure: MigrationFailureResult };

// ─── Internal helpers ─────────────────────────────────────────────────────────

function buildMigrationHash(
  sourceVersion: string,
  scenarioId: string,
  steps: readonly string[],
): string {
  return djb2(
    [sourceVersion, CURRENT_SNAPSHOT_VERSION, scenarioId, steps.join(';')].join('|'),
  );
}

function buildFailureHash(
  code: MigrationFailureCode,
  sourceVersion: string | null,
  scenarioId: string | null,
): string {
  return djb2(
    [code, sourceVersion ?? 'null', scenarioId ?? 'null'].join('|'),
  );
}

function makeFailure(
  code: MigrationFailureCode,
  reason: string,
  sourceVersion: string | null,
  scenarioId: string | null,
): MigrationGuardResult {
  return {
    ok: false,
    failure: {
      failureCode:       code,
      failureReason:     reason,
      sourceVersion,
      targetVersion:     CURRENT_SNAPSHOT_VERSION,
      scenarioId,
      migrationAllowed:  false,
      failureHash:       buildFailureHash(code, sourceVersion, scenarioId),
    },
  };
}

// ─── v0 → v1 migration ───────────────────────────────────────────────────────

function migrateV0ToV1(
  raw: Record<string, unknown>,
  scenarioId: string,
): MigrationGuardResult {
  // Validate v0 required fields
  const fts = raw['finalTurnState'];
  if (fts === null || typeof fts !== 'object' || Array.isArray(fts)) {
    return makeFailure(
      'MALFORMED_INPUT',
      'v0 snapshot finalTurnState field is absent or not an object',
      'v0',
      scenarioId,
    );
  }
  const ftsObj = fts as Record<string, unknown>;
  if (typeof ftsObj['turnId'] !== 'string' || typeof ftsObj['resolved'] !== 'boolean') {
    return makeFailure(
      'MALFORMED_INPUT',
      'v0 snapshot finalTurnState is missing required fields (turnId, resolved)',
      'v0',
      scenarioId,
    );
  }
  const auditTrail = raw['auditTrail'];
  if (!Array.isArray(auditTrail)) {
    return makeFailure(
      'MALFORMED_INPUT',
      'v0 snapshot auditTrail field is absent or not an array',
      'v0',
      scenarioId,
    );
  }

  const auditTrailArr = auditTrail as string[];
  const pressureLevel = typeof ftsObj['pressureLevel'] === 'number' ? ftsObj['pressureLevel'] : 0;
  const turnId = ftsObj['turnId'] as string;
  const resolved = ftsObj['resolved'] as boolean;

  // Build the migrated v1 snapshot — fill in all fields absent in v0
  const migratedFinalState = {
    turnId,
    currentPhase:        null as null,
    pressureLevel,
    resolved,
    completedPhaseCount: auditTrailArr.length,
  };

  // Build a stable signature from the migrated state.
  // deterministicProof is false — we cannot claim the original run was
  // deterministic from the perspective of this migrated snapshot alone.
  const sig = buildRuntimeSignature({
    scenarioId,
    initialState:   {},
    orderedActions: [],
    finalState:     migratedFinalState as unknown as Record<string, unknown>,
    auditTrail:     auditTrailArr,
    deterministicProof: false,
  });

  const migratedSnapshot: TurnPersistenceSnapshot = {
    schemaVersion:     'v1',
    scenarioId,
    phaseOrder:        [...PHASE_ORDER],
    finalTurnState:    migratedFinalState,
    auditTrail:        [...auditTrailArr],
    signature: {
      actionCount:        sig.actionCount,
      auditHash:          sig.auditHash,
      combinedHash:       sig.combinedHash,
      deterministicProof: false,
      finalStateHash:     sig.finalStateHash,
      initialStateHash:   sig.initialStateHash,
      inputHash:          sig.inputHash,
      memoryHash:         sig.memoryHash,
      scenarioId:         sig.scenarioId,
      signatureVersion:   sig.signatureVersion,
    },
    deterministicProof: false,
  };

  const steps = MIGRATION_STEPS_V0_TO_V1;

  return {
    ok: true,
    migration: {
      sourceVersion:     'v0',
      targetVersion:     CURRENT_SNAPSHOT_VERSION,
      scenarioId,
      migrationApplied:  true,
      migrationSteps:    steps,
      migratedSnapshot,
      migrationHash:     buildMigrationHash('v0', scenarioId, steps),
    },
  };
}

// ─── Main migration entry point ───────────────────────────────────────────────

/**
 * Migrate a persisted turn snapshot to the current schema version.
 *
 * Version handling:
 *   v0  — migrated to v1 (migrationApplied: true)
 *   v1  — returned as-is (migrationApplied: false, empty migrationSteps)
 *
 * Failure cases (returned as ok: false — never throws):
 *   MISSING_SOURCE_VERSION      — schemaVersion absent or not a string
 *   UNSUPPORTED_OLD_VERSION     — version string present but not in 'vN' format
 *                                 (pre-dates the versioning scheme)
 *   UNSUPPORTED_FUTURE_VERSION  — 'vN' where N > 1
 *   MALFORMED_INPUT             — JSON parse failure or required v0 fields missing
 */
export function migrateSnapshot(json: string): MigrationGuardResult {
  // ── Step 0: JSON parse ────────────────────────────────────────────────────
  let raw: Record<string, unknown>;
  try {
    raw = JSON.parse(json) as Record<string, unknown>;
  } catch {
    return makeFailure(
      'MALFORMED_INPUT',
      'Input is not valid JSON — parse failed before version check',
      null,
      null,
    );
  }

  // Extract version and scenarioId early for inclusion in any failure result.
  const version    = typeof raw['schemaVersion'] === 'string' ? raw['schemaVersion'] : null;
  const scenarioId = (typeof raw['scenarioId'] === 'string' && raw['scenarioId'].length > 0)
    ? raw['scenarioId']
    : null;

  // ── Step 1: MISSING_SOURCE_VERSION ────────────────────────────────────────
  if (version === null) {
    return makeFailure(
      'MISSING_SOURCE_VERSION',
      'schemaVersion field is absent or not a string — cannot determine migration path',
      null,
      scenarioId,
    );
  }

  // ── Step 2: Classify version ──────────────────────────────────────────────
  // Supported format: 'vN' where N is a non-negative integer.
  // Anything else is a pre-versioning-scheme legacy format.
  const versionMatch = /^v(\d+)$/.exec(version);

  if (versionMatch === null) {
    // Version string present but doesn't follow the 'vN' scheme.
    // This indicates a snapshot from before the versioned naming convention.
    return makeFailure(
      'UNSUPPORTED_OLD_VERSION',
      `schemaVersion '${version}' does not follow the 'vN' versioning scheme — ` +
      `it pre-dates the current versioning convention and cannot be migrated`,
      version,
      scenarioId,
    );
  }

  const versionNum = parseInt(versionMatch[1], 10);

  // ── Step 3: UNSUPPORTED_FUTURE_VERSION ────────────────────────────────────
  if (versionNum > 1) {
    return makeFailure(
      'UNSUPPORTED_FUTURE_VERSION',
      `schemaVersion '${version}' is newer than the current version 'v1' — ` +
      `downgrade is not supported`,
      version,
      scenarioId,
    );
  }

  // ── Step 4: Identity migration for current version ────────────────────────
  if (versionNum === 1) {
    // Already v1 — restore directly, return a no-op migration result.
    const snapshot = restoreTurnSnapshot(json);
    const noSteps: readonly string[] = [];
    return {
      ok: true,
      migration: {
        sourceVersion:    'v1',
        targetVersion:    CURRENT_SNAPSHOT_VERSION,
        scenarioId:       snapshot.scenarioId,
        migrationApplied: false,
        migrationSteps:   noSteps,
        migratedSnapshot: snapshot,
        migrationHash:    buildMigrationHash('v1', snapshot.scenarioId, noSteps),
      },
    };
  }

  // ── Step 5: v0 → v1 migration ─────────────────────────────────────────────
  // versionNum === 0
  if (scenarioId === null) {
    return makeFailure(
      'MALFORMED_INPUT',
      'v0 snapshot scenarioId is absent or empty',
      version,
      null,
    );
  }

  return migrateV0ToV1(raw, scenarioId);
}

// ─── v0 fixture factory ───────────────────────────────────────────────────────

/**
 * Build a canonical v0 snapshot JSON string from the first clean turn scenario.
 *
 * The v0 format includes only: schemaVersion, scenarioId, finalTurnState
 * (turnId, resolved, pressureLevel), and auditTrail.  All fields added in v1
 * are intentionally absent.
 *
 * This factory is deterministic: identical calls produce identical JSON.
 */
export function buildV0SnapshotJson(
  scenarioId: string,
  turnId: string,
  resolved: boolean,
  pressureLevel: number,
  auditTrail: readonly string[],
): string {
  const v0: V0TurnSnapshotRaw = {
    schemaVersion: 'v0',
    scenarioId,
    finalTurnState: { turnId, resolved, pressureLevel },
    auditTrail: [...auditTrail],
  };
  // Stable key order — same as serializeTurnResult
  return JSON.stringify(v0, (_key, value: unknown) => {
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      const sorted: Record<string, unknown> = {};
      for (const k of Object.keys(value as object).sort()) {
        sorted[k] = (value as Record<string, unknown>)[k];
      }
      return sorted;
    }
    return value;
  });
}
