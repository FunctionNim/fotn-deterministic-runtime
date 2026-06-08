/**
 * R24 — Turn Phase Persistence Canonical Export
 *
 * Produces stable, portable JSON artifacts for persisted turn phase snapshots
 * and their associated guard/migration results.  Designed for external tools,
 * future UI layers, debugging, and archive inspection.
 *
 * Export kinds:
 *   'snapshot'          — valid persisted clean-turn snapshot
 *   'migration'         — migrated snapshot result (v0 → v1)
 *   'corruption-failure' — corruption guard failure result
 *   'migration-failure' — migration failure result
 *
 * Determinism guarantees:
 *   - No wall-clock timestamp
 *   - No random identifier
 *   - Object keys sorted alphabetically at every nesting level
 *   - Array element order preserved and significant
 *   - Byte-identical JSON on every call with identical inputs
 *
 * Doctrine: Pressure → Function → Consequence → Audit → Meaning
 */

import { djb2, stableJson } from '../runtime-signature/runtime-signature.js';
import type { TurnPersistenceSnapshot } from './turn-persistence.js';
import type { CorruptionFailureResult } from './turn-corruption-guard.js';
import type { SnapshotMigrationResult, MigrationFailureResult } from './turn-snapshot-migration.js';

// ─── Export version and policy ────────────────────────────────────────────────

/** Incremented when the export envelope shape changes. */
export const EXPORT_VERSION = 'e1' as const;
export type ExportVersion = typeof EXPORT_VERSION;

/**
 * Explicit policy declaration that this export contains no wall-clock time,
 * no random identifiers, and no environment-specific data.
 */
export const EXPORTED_AT_POLICY = 'deterministic/static/no-wall-clock-time' as const;
export type ExportedAtPolicy = typeof EXPORTED_AT_POLICY;

// ─── Scenario ID ─────────────────────────────────────────────────────────────

/**
 * Stable scenario identifier for the canonical export fixture.
 * Not registered in the Scenario Registry — export artifacts are structured
 * PersistenceExport objects, not ReplayResults.
 */
export const SCENARIO_PERSISTENCE_CANONICAL_EXPORT =
  'turn-pipeline:persistence-canonical-export';

// ─── Export kinds ─────────────────────────────────────────────────────────────

/** Discriminator for the four export kinds produced by this module. */
export type ExportKind =
  | 'snapshot'
  | 'migration'
  | 'corruption-failure'
  | 'migration-failure';

// ─── Export envelope ─────────────────────────────────────────────────────────

/**
 * Stable canonical export envelope.
 *
 * All fields are JSON-serializable.  The exportHash commits to the full
 * envelope content (excluding itself) so consumers can detect truncation
 * or modification.
 */
export interface PersistenceExport {
  /** Export envelope version — always 'e1' for exports built by this module. */
  readonly exportVersion: ExportVersion;
  /** Discriminator identifying what this export contains. */
  readonly exportKind: ExportKind;
  /** Scenario identifier from the source data, or null if not present. */
  readonly scenarioId: string | null;
  /**
   * schemaVersion of the snapshot payload, or null when not applicable.
   * Present for 'snapshot' and 'corruption-failure' exports.
   */
  readonly snapshotVersion: string | null;
  /**
   * Source schema version for migration exports, or null.
   * Present for 'migration' and 'migration-failure' exports.
   */
  readonly sourceVersion: string | null;
  /**
   * Target schema version for migration exports, or null.
   * Present for 'migration' and 'migration-failure' exports.
   */
  readonly targetVersion: string | null;
  /** Explicit policy statement — no wall-clock time, no random IDs. */
  readonly exportedAtPolicy: ExportedAtPolicy;
  /**
   * Deterministic djb2 hash of the full export content (all fields except
   * exportHash itself).  Changes when any field in the envelope or payload
   * changes.
   */
  readonly exportHash: string;
  /** The exported data.  Shape depends on exportKind. */
  readonly payload: Record<string, unknown>;
}

// ─── Internal serialiser ─────────────────────────────────────────────────────

/**
 * Recursively sort all object keys and serialize to compact JSON.
 * Arrays are preserved in their original order.
 * Byte-identical across environments given identical inputs.
 */
function stableSortedJson(value: unknown): string {
  return JSON.stringify(value, (_key, v: unknown) => {
    if (v !== null && typeof v === 'object' && !Array.isArray(v)) {
      const sorted: Record<string, unknown> = {};
      for (const k of Object.keys(v as object).sort()) {
        sorted[k] = (v as Record<string, unknown>)[k];
      }
      return sorted;
    }
    return v;
  });
}

// ─── Internal builder ─────────────────────────────────────────────────────────

function buildExportJson(
  kind: ExportKind,
  scenarioId: string | null,
  snapshotVersion: string | null,
  sourceVersion: string | null,
  targetVersion: string | null,
  payload: Record<string, unknown>,
): string {
  // Hash everything except exportHash itself, using stable JSON.
  const hashInput = stableJson({
    exportedAtPolicy: EXPORTED_AT_POLICY,
    exportKind: kind,
    exportVersion: EXPORT_VERSION,
    payload,
    scenarioId,
    snapshotVersion,
    sourceVersion,
    targetVersion,
  });
  const exportHash = djb2(hashInput);

  const envelope: PersistenceExport = {
    exportVersion:    EXPORT_VERSION,
    exportKind:       kind,
    scenarioId,
    snapshotVersion,
    sourceVersion,
    targetVersion,
    exportedAtPolicy: EXPORTED_AT_POLICY,
    exportHash,
    payload,
  };

  return stableSortedJson(envelope);
}

// ─── Public export functions ──────────────────────────────────────────────────

/**
 * Export a valid TurnPersistenceSnapshot as a canonical JSON artifact.
 *
 * The payload IS the snapshot, so `JSON.stringify(parsed.payload)` can be
 * passed to `restoreTurnSnapshot` to reconstruct the original snapshot.
 */
export function exportSnapshot(snapshot: TurnPersistenceSnapshot): string {
  const payload = JSON.parse(stableSortedJson(snapshot)) as Record<string, unknown>;
  return buildExportJson(
    'snapshot',
    snapshot.scenarioId,
    snapshot.schemaVersion,
    null,
    null,
    payload,
  );
}

/**
 * Export a SnapshotMigrationResult as a canonical JSON artifact.
 *
 * The payload includes migrationApplied, migrationSteps, migrationHash, and
 * the full migratedSnapshot.  `JSON.stringify(parsed.payload.migratedSnapshot)`
 * can be passed to `restoreTurnSnapshot`.
 */
export function exportMigrationResult(migration: SnapshotMigrationResult): string {
  const payload: Record<string, unknown> = {
    migrationApplied:  migration.migrationApplied,
    migrationHash:     migration.migrationHash,
    migrationSteps:    [...migration.migrationSteps],
    migratedSnapshot:  JSON.parse(stableSortedJson(migration.migratedSnapshot)) as Record<string, unknown>,
  };
  return buildExportJson(
    'migration',
    migration.scenarioId,
    null,
    migration.sourceVersion,
    migration.targetVersion,
    payload,
  );
}

/**
 * Export a CorruptionFailureResult as a canonical JSON artifact.
 *
 * The payload includes restoreAllowed: false so consumers can confirm that
 * this export must not be used to reconstruct runtime state.
 */
export function exportCorruptionFailure(failure: CorruptionFailureResult): string {
  const payload: Record<string, unknown> = {
    corruptedField:    failure.corruptedField,
    failureCode:       failure.failureCode,
    failureHash:       failure.failureHash,
    failureReason:     failure.failureReason,
    restoreAllowed:    false,
  };
  return buildExportJson(
    'corruption-failure',
    failure.snapshotScenarioId,
    failure.snapshotVersion,
    null,
    null,
    payload,
  );
}

/**
 * Export a MigrationFailureResult as a canonical JSON artifact.
 *
 * The payload includes migrationAllowed: false so consumers can confirm that
 * this export must not be used to reconstruct runtime state.
 */
export function exportMigrationFailure(failure: MigrationFailureResult): string {
  const payload: Record<string, unknown> = {
    failureCode:      failure.failureCode,
    failureHash:      failure.failureHash,
    failureReason:    failure.failureReason,
    migrationAllowed: false,
  };
  return buildExportJson(
    'migration-failure',
    failure.scenarioId,
    null,
    failure.sourceVersion,
    failure.targetVersion,
    payload,
  );
}

// ─── Export parser ────────────────────────────────────────────────────────────

/**
 * Parse and structurally validate a canonical export JSON string.
 *
 * Returns the typed PersistenceExport on success, or throws a descriptive
 * error if the JSON is invalid or the envelope shape is wrong.
 *
 * Does NOT re-verify exportHash — use verifyExportHash for that.
 */
export function parseExport(json: string): PersistenceExport {
  const raw = JSON.parse(json) as Record<string, unknown>;
  if (raw['exportVersion'] !== EXPORT_VERSION) {
    throw new Error(
      `PersistenceExport: unsupported exportVersion '${raw['exportVersion']}'. ` +
      `Expected '${EXPORT_VERSION}'.`,
    );
  }
  return raw as unknown as PersistenceExport;
}

/**
 * Verify that exportHash in a parsed export matches the recomputed hash of
 * its content.  Returns true when the envelope is intact; false when any
 * field has been modified since export.
 */
export function verifyExportHash(exported: PersistenceExport): boolean {
  const hashInput = stableJson({
    exportedAtPolicy: exported.exportedAtPolicy,
    exportKind:       exported.exportKind,
    exportVersion:    exported.exportVersion,
    payload:          exported.payload,
    scenarioId:       exported.scenarioId,
    snapshotVersion:  exported.snapshotVersion,
    sourceVersion:    exported.sourceVersion,
    targetVersion:    exported.targetVersion,
  });
  return djb2(hashInput) === exported.exportHash;
}
