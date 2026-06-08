/**
 * R24 — Turn Phase Persistence Canonical Export tests.
 *
 * Proves that the canonical export module produces stable, portable JSON
 * artifacts for snapshots, migration results, and failure results, with no
 * wall-clock timestamps, stable key order, and restorable payloads for
 * success exports.
 *
 * Export scenario ID: turn-pipeline:persistence-canonical-export
 *
 * Guarantees proved:
 *   - Same valid snapshot export produces identical JSON across repeated runs
 *   - Migrated snapshot export produces identical JSON across repeated runs
 *   - Corruption failure export produces identical JSON across repeated runs
 *   - Unsupported migration failure export produces identical JSON across repeated runs
 *   - No wall-clock timestamp in any export kind
 *   - Object key order is stable
 *   - Array order remains significant
 *   - Snapshot export payload restores via restoreTurnSnapshot
 *   - Migration export payload's migratedSnapshot restores via restoreTurnSnapshot
 *   - Corruption/failure exports carry restoreAllowed/migrationAllowed: false
 *   - exportHash verifies correctly for all kinds
 *   - Clean-turn, recovery, corruption guard, and migration fixtures unaffected
 */

import { describe, it, expect } from 'vitest';
import {
  SCENARIO_PERSISTENCE_CANONICAL_EXPORT,
  EXPORT_VERSION,
  EXPORTED_AT_POLICY,
  exportSnapshot,
  exportMigrationResult,
  exportCorruptionFailure,
  exportMigrationFailure,
  parseExport,
  verifyExportHash,
} from '../../src/turn-persistence/turn-persistence-export.js';
import {
  serializeTurnResult,
  restoreTurnSnapshot,
  SCENARIO_PERSISTED_CLEAN_TURN,
} from '../../src/turn-persistence/turn-persistence.js';
import {
  guardTurnSnapshot,
} from '../../src/turn-persistence/turn-corruption-guard.js';
import {
  migrateSnapshot,
  buildV0SnapshotJson,
  SCENARIO_MIGRATED_V0,
} from '../../src/turn-persistence/turn-snapshot-migration.js';
import {
  SCENARIO_FIRST_CLEAN_TURN,
  firstCleanTurnScenario,
  failureThenCleanRecoveryScenario,
} from '../../src/turn-pipeline/turn-pipeline.js';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function validSnapshot() {
  return restoreTurnSnapshot(serializeTurnResult(firstCleanTurnScenario()));
}

function v0Json() {
  const clean = firstCleanTurnScenario();
  const fs = clean.finalState as Record<string, unknown>;
  return buildV0SnapshotJson(
    SCENARIO_FIRST_CLEAN_TURN,
    fs['turnId'] as string,
    fs['resolved'] as boolean,
    fs['pressureLevel'] as number,
    [...clean.auditTrail],
  );
}

function corruptionFailure() {
  const json = JSON.stringify({
    schemaVersion: 'v1',
    scenarioId: SCENARIO_FIRST_CLEAN_TURN,
    auditTrail: [],
    finalTurnState: { resolved: true },
    phaseOrder: [],
    signature: { combinedHash: 'abc' },
  });
  const result = guardTurnSnapshot(json);
  if (!result.ok) return result.failure;
  throw new Error('Expected corruption failure');
}

function migrationFailure() {
  const result = migrateSnapshot(JSON.stringify({ schemaVersion: 'v2', scenarioId: 'x' }));
  if (!result.ok) return result.failure;
  throw new Error('Expected migration failure');
}

function migrationSuccess() {
  const result = migrateSnapshot(v0Json());
  if (result.ok) return result.migration;
  throw new Error('Expected migration success');
}

// ─── Export version constants ─────────────────────────────────────────────────

describe('R24 Export — constants', () => {

  it('EXPORT_VERSION is e1', () => {
    expect(EXPORT_VERSION).toBe('e1');
  });

  it('EXPORTED_AT_POLICY is deterministic/static/no-wall-clock-time', () => {
    expect(EXPORTED_AT_POLICY).toBe('deterministic/static/no-wall-clock-time');
  });

  it('SCENARIO_PERSISTENCE_CANONICAL_EXPORT is defined and non-empty', () => {
    expect(typeof SCENARIO_PERSISTENCE_CANONICAL_EXPORT).toBe('string');
    expect(SCENARIO_PERSISTENCE_CANONICAL_EXPORT.length).toBeGreaterThan(0);
  });

});

// ─── Snapshot export determinism ─────────────────────────────────────────────

describe('R24 Export — snapshot export is deterministic', () => {

  it('two calls to exportSnapshot produce identical JSON strings', () => {
    const a = exportSnapshot(validSnapshot());
    const b = exportSnapshot(validSnapshot());
    expect(a).toBe(b);
  });

  it('exportSnapshot returns valid parseable JSON', () => {
    expect(() => JSON.parse(exportSnapshot(validSnapshot()))).not.toThrow();
  });

  it('exportKind is snapshot', () => {
    const parsed = JSON.parse(exportSnapshot(validSnapshot()));
    expect(parsed.exportKind).toBe('snapshot');
  });

  it('exportVersion is e1', () => {
    const parsed = JSON.parse(exportSnapshot(validSnapshot()));
    expect(parsed.exportVersion).toBe('e1');
  });

  it('scenarioId is SCENARIO_FIRST_CLEAN_TURN', () => {
    const parsed = JSON.parse(exportSnapshot(validSnapshot()));
    expect(parsed.scenarioId).toBe(SCENARIO_FIRST_CLEAN_TURN);
  });

  it('snapshotVersion is v1', () => {
    const parsed = JSON.parse(exportSnapshot(validSnapshot()));
    expect(parsed.snapshotVersion).toBe('v1');
  });

});

// ─── Migration result export determinism ─────────────────────────────────────

describe('R24 Export — migration result export is deterministic', () => {

  it('two calls to exportMigrationResult produce identical JSON strings', () => {
    const a = exportMigrationResult(migrationSuccess());
    const b = exportMigrationResult(migrationSuccess());
    expect(a).toBe(b);
  });

  it('exportKind is migration', () => {
    const parsed = JSON.parse(exportMigrationResult(migrationSuccess()));
    expect(parsed.exportKind).toBe('migration');
  });

  it('sourceVersion is v0', () => {
    const parsed = JSON.parse(exportMigrationResult(migrationSuccess()));
    expect(parsed.sourceVersion).toBe('v0');
  });

  it('targetVersion is v1', () => {
    const parsed = JSON.parse(exportMigrationResult(migrationSuccess()));
    expect(parsed.targetVersion).toBe('v1');
  });

  it('payload.migrationApplied is true', () => {
    const parsed = JSON.parse(exportMigrationResult(migrationSuccess()));
    expect(parsed.payload.migrationApplied).toBe(true);
  });

});

// ─── Corruption failure export determinism ────────────────────────────────────

describe('R24 Export — corruption failure export is deterministic', () => {

  it('two calls to exportCorruptionFailure produce identical JSON strings', () => {
    const a = exportCorruptionFailure(corruptionFailure());
    const b = exportCorruptionFailure(corruptionFailure());
    expect(a).toBe(b);
  });

  it('exportKind is corruption-failure', () => {
    const parsed = JSON.parse(exportCorruptionFailure(corruptionFailure()));
    expect(parsed.exportKind).toBe('corruption-failure');
  });

  it('payload.restoreAllowed is false', () => {
    const parsed = JSON.parse(exportCorruptionFailure(corruptionFailure()));
    expect(parsed.payload.restoreAllowed).toBe(false);
  });

  it('payload.failureCode is a non-empty string', () => {
    const parsed = JSON.parse(exportCorruptionFailure(corruptionFailure()));
    expect(typeof parsed.payload.failureCode).toBe('string');
    expect(parsed.payload.failureCode.length).toBeGreaterThan(0);
  });

});

// ─── Migration failure export determinism ─────────────────────────────────────

describe('R24 Export — migration failure export is deterministic', () => {

  it('two calls to exportMigrationFailure produce identical JSON strings', () => {
    const a = exportMigrationFailure(migrationFailure());
    const b = exportMigrationFailure(migrationFailure());
    expect(a).toBe(b);
  });

  it('exportKind is migration-failure', () => {
    const parsed = JSON.parse(exportMigrationFailure(migrationFailure()));
    expect(parsed.exportKind).toBe('migration-failure');
  });

  it('payload.migrationAllowed is false', () => {
    const parsed = JSON.parse(exportMigrationFailure(migrationFailure()));
    expect(parsed.payload.migrationAllowed).toBe(false);
  });

  it('payload.failureCode is UNSUPPORTED_FUTURE_VERSION', () => {
    const parsed = JSON.parse(exportMigrationFailure(migrationFailure()));
    expect(parsed.payload.failureCode).toBe('UNSUPPORTED_FUTURE_VERSION');
  });

});

// ─── No wall-clock timestamp ──────────────────────────────────────────────────

describe('R24 Export — no wall-clock timestamp in any export', () => {

  it('exportedAtPolicy declares no-wall-clock-time (snapshot)', () => {
    const parsed = JSON.parse(exportSnapshot(validSnapshot()));
    expect(parsed.exportedAtPolicy).toBe('deterministic/static/no-wall-clock-time');
  });

  it('exportedAtPolicy declares no-wall-clock-time (migration)', () => {
    const parsed = JSON.parse(exportMigrationResult(migrationSuccess()));
    expect(parsed.exportedAtPolicy).toBe('deterministic/static/no-wall-clock-time');
  });

  it('exportedAtPolicy declares no-wall-clock-time (corruption-failure)', () => {
    const parsed = JSON.parse(exportCorruptionFailure(corruptionFailure()));
    expect(parsed.exportedAtPolicy).toBe('deterministic/static/no-wall-clock-time');
  });

  it('exportedAtPolicy declares no-wall-clock-time (migration-failure)', () => {
    const parsed = JSON.parse(exportMigrationFailure(migrationFailure()));
    expect(parsed.exportedAtPolicy).toBe('deterministic/static/no-wall-clock-time');
  });

  it('snapshot export JSON contains no Date-like string (no ISO 8601)', () => {
    const json = exportSnapshot(validSnapshot());
    expect(json).not.toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/);
  });

});

// ─── Object key order is stable ───────────────────────────────────────────────

describe('R24 Export — object key order is stable', () => {

  it('snapshot export keys are in alphabetical order at top level', () => {
    const parsed = JSON.parse(exportSnapshot(validSnapshot())) as Record<string, unknown>;
    const keys = Object.keys(parsed);
    expect(keys).toEqual([...keys].sort());
  });

  it('migration export keys are in alphabetical order at top level', () => {
    const parsed = JSON.parse(exportMigrationResult(migrationSuccess())) as Record<string, unknown>;
    const keys = Object.keys(parsed);
    expect(keys).toEqual([...keys].sort());
  });

  it('corruption-failure export keys are in alphabetical order at top level', () => {
    const parsed = JSON.parse(exportCorruptionFailure(corruptionFailure())) as Record<string, unknown>;
    const keys = Object.keys(parsed);
    expect(keys).toEqual([...keys].sort());
  });

});

// ─── Array order remains significant ──────────────────────────────────────────

describe('R24 Export — array order remains significant', () => {

  it('snapshot export payload auditTrail first event is StartOfTurn', () => {
    const parsed = JSON.parse(exportSnapshot(validSnapshot()));
    const auditTrail = parsed.payload.auditTrail as string[];
    expect(auditTrail[0]).toMatch(/StartOfTurn/);
  });

  it('snapshot export payload auditTrail last event is EndOfTurn', () => {
    const parsed = JSON.parse(exportSnapshot(validSnapshot()));
    const auditTrail = parsed.payload.auditTrail as string[];
    expect(auditTrail[auditTrail.length - 1]).toMatch(/EndOfTurn/);
  });

  it('migration export payload migrationSteps array is ordered (first step contains scenarioId)', () => {
    const parsed = JSON.parse(exportMigrationResult(migrationSuccess()));
    const steps = parsed.payload.migrationSteps as string[];
    expect(steps[0]).toContain('scenarioId');
  });

});

// ─── Exported payload restores or validates ───────────────────────────────────

describe('R24 Export — exported snapshot payload restores via restoreTurnSnapshot', () => {

  it('snapshot payload JSON restores to a TurnPersistenceSnapshot', () => {
    const json    = exportSnapshot(validSnapshot());
    const parsed  = JSON.parse(json);
    const payloadJson = JSON.stringify(parsed.payload);
    const restored = restoreTurnSnapshot(payloadJson);
    expect(restored.scenarioId).toBe(SCENARIO_FIRST_CLEAN_TURN);
  });

  it('restored snapshot from payload has deterministicProof: true', () => {
    const parsed  = JSON.parse(exportSnapshot(validSnapshot()));
    const restored = restoreTurnSnapshot(JSON.stringify(parsed.payload));
    expect(restored.deterministicProof).toBe(true);
  });

  it('restored snapshot from payload has 7 audit events', () => {
    const parsed  = JSON.parse(exportSnapshot(validSnapshot()));
    const restored = restoreTurnSnapshot(JSON.stringify(parsed.payload));
    expect(restored.auditTrail.length).toBe(7);
  });

  it('migration payload migratedSnapshot restores via restoreTurnSnapshot', () => {
    const parsed  = JSON.parse(exportMigrationResult(migrationSuccess()));
    const migratedSnapshotJson = JSON.stringify(parsed.payload.migratedSnapshot);
    const restored = restoreTurnSnapshot(migratedSnapshotJson);
    expect(restored.scenarioId).toBe(SCENARIO_FIRST_CLEAN_TURN);
  });

  it('restored migratedSnapshot has correct auditTrail length', () => {
    const parsed  = JSON.parse(exportMigrationResult(migrationSuccess()));
    const restored = restoreTurnSnapshot(JSON.stringify(parsed.payload.migratedSnapshot));
    expect(restored.auditTrail.length).toBe(7);
  });

});

// ─── Failure exports do not allow restore ─────────────────────────────────────

describe('R24 Export — failure exports explicitly disallow restore', () => {

  it('corruption-failure payload has restoreAllowed: false', () => {
    const parsed = JSON.parse(exportCorruptionFailure(corruptionFailure()));
    expect(parsed.payload.restoreAllowed).toBe(false);
  });

  it('migration-failure payload has migrationAllowed: false', () => {
    const parsed = JSON.parse(exportMigrationFailure(migrationFailure()));
    expect(parsed.payload.migrationAllowed).toBe(false);
  });

});

// ─── exportHash verifies correctly ────────────────────────────────────────────

describe('R24 Export — exportHash verifies correctly', () => {

  it('verifyExportHash returns true for a freshly built snapshot export', () => {
    const exported = parseExport(exportSnapshot(validSnapshot()));
    expect(verifyExportHash(exported)).toBe(true);
  });

  it('verifyExportHash returns true for a freshly built migration export', () => {
    const exported = parseExport(exportMigrationResult(migrationSuccess()));
    expect(verifyExportHash(exported)).toBe(true);
  });

  it('verifyExportHash returns true for a freshly built corruption-failure export', () => {
    const exported = parseExport(exportCorruptionFailure(corruptionFailure()));
    expect(verifyExportHash(exported)).toBe(true);
  });

  it('verifyExportHash returns true for a freshly built migration-failure export', () => {
    const exported = parseExport(exportMigrationFailure(migrationFailure()));
    expect(verifyExportHash(exported)).toBe(true);
  });

  it('verifyExportHash returns false after payload is tampered', () => {
    const json = exportSnapshot(validSnapshot());
    const parsed = JSON.parse(json) as Record<string, unknown>;
    const payload = parsed['payload'] as Record<string, unknown>;
    payload['scenarioId'] = 'tampered';
    const tampered = parsed as unknown as import('../../src/turn-persistence/turn-persistence-export.js').PersistenceExport;
    expect(verifyExportHash(tampered)).toBe(false);
  });

  it('exportHash is stable across two independent export calls', () => {
    const a = parseExport(exportSnapshot(validSnapshot()));
    const b = parseExport(exportSnapshot(validSnapshot()));
    expect(a.exportHash).toBe(b.exportHash);
  });

});

// ─── parseExport validates envelope ──────────────────────────────────────────

describe('R24 Export — parseExport validates envelope', () => {

  it('parseExport succeeds for a valid snapshot export', () => {
    const exported = parseExport(exportSnapshot(validSnapshot()));
    expect(exported.exportVersion).toBe('e1');
    expect(exported.exportKind).toBe('snapshot');
  });

  it('parseExport throws for wrong exportVersion', () => {
    const json = JSON.stringify({ exportVersion: 'e0', exportKind: 'snapshot' });
    expect(() => parseExport(json)).toThrow(/exportVersion/);
  });

});

// ─── Isolation — other systems unaffected ────────────────────────────────────

describe('R24 Export — isolation (other systems unaffected)', () => {

  it('firstCleanTurnScenario is unaffected after export tests', () => {
    exportSnapshot(validSnapshot());
    const clean = firstCleanTurnScenario();
    expect(clean.finalState.resolved).toBe(true);
    expect(clean.signature.deterministicProof).toBe(true);
  });

  it('failureThenCleanRecoveryScenario is unaffected after export tests', () => {
    exportSnapshot(validSnapshot());
    const rec = failureThenCleanRecoveryScenario();
    expect(rec.signature.deterministicProof).toBe(true);
  });

  it('corruption guard is unaffected — valid JSON still passes', () => {
    exportSnapshot(validSnapshot());
    const guardResult = guardTurnSnapshot(serializeTurnResult(firstCleanTurnScenario()));
    expect(guardResult.ok).toBe(true);
  });

  it('migration fixture is unaffected — v0 still migrates', () => {
    exportSnapshot(validSnapshot());
    const result = migrateSnapshot(v0Json());
    expect(result.ok).toBe(true);
  });

  it('SCENARIO_PERSISTENCE_CANONICAL_EXPORT differs from SCENARIO_MIGRATED_V0', () => {
    expect(SCENARIO_PERSISTENCE_CANONICAL_EXPORT).not.toBe(SCENARIO_MIGRATED_V0);
  });

  it('SCENARIO_PERSISTENCE_CANONICAL_EXPORT differs from SCENARIO_PERSISTED_CLEAN_TURN', () => {
    expect(SCENARIO_PERSISTENCE_CANONICAL_EXPORT).not.toBe(SCENARIO_PERSISTED_CLEAN_TURN);
  });

});
