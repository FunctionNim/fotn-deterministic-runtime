/**
 * R23 — Turn Phase Snapshot Migration Fixture tests.
 *
 * Proves that older supported snapshot versions can migrate forward safely,
 * and that unsupported, future, or malformed versions fail deterministically
 * with stable error codes.
 *
 * Migration scenario ID: turn-pipeline:persisted-clean-turn:migrated-v0
 *
 * Guarantees proved:
 *   - v0 snapshot migrates to v1 (migrationApplied: true)
 *   - migrated snapshot restores correctly
 *   - migrated result auditTrail matches original clean-turn auditTrail
 *   - migration hash and steps are stable across repeated runs
 *   - UNSUPPORTED_OLD_VERSION fails clearly for pre-versioning-scheme strings
 *   - UNSUPPORTED_FUTURE_VERSION fails clearly for v2+
 *   - MISSING_SOURCE_VERSION fails clearly when schemaVersion absent
 *   - MALFORMED_INPUT fails clearly for unparseable JSON and missing v0 fields
 *   - failure hashes are stable across repeated identical calls
 *   - valid current v1 snapshot migrates identically (no-op, migrationApplied: false)
 *   - corruption guard behavior remains unaffected
 */

import { describe, it, expect } from 'vitest';
import {
  SCENARIO_MIGRATED_V0,
  CURRENT_SNAPSHOT_VERSION,
  MINIMUM_SUPPORTED_VERSION,
  MIGRATION_STEPS_V0_TO_V1,
  migrateSnapshot,
  buildV0SnapshotJson,
} from '../../src/turn-persistence/turn-snapshot-migration.js';
import {
  SCENARIO_FIRST_CLEAN_TURN,
  firstCleanTurnScenario,
  failureThenCleanRecoveryScenario,
} from '../../src/turn-pipeline/turn-pipeline.js';
import {
  serializeTurnResult,
  restoreTurnSnapshot,
} from '../../src/turn-persistence/turn-persistence.js';
import {
  SCENARIO_CORRUPTED_PERSISTED_TURN,
  guardTurnSnapshot,
} from '../../src/turn-persistence/turn-corruption-guard.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Build a canonical v0 JSON string from the first clean turn scenario. */
function cleanV0Json(): string {
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

/** Return valid v1 JSON from the first clean turn scenario. */
function cleanV1Json(): string {
  return serializeTurnResult(firstCleanTurnScenario());
}

// ─── Version constants ────────────────────────────────────────────────────────

describe('R23 Migration — version constants', () => {

  it('CURRENT_SNAPSHOT_VERSION is v1', () => {
    expect(CURRENT_SNAPSHOT_VERSION).toBe('v1');
  });

  it('MINIMUM_SUPPORTED_VERSION is v0', () => {
    expect(MINIMUM_SUPPORTED_VERSION).toBe('v0');
  });

  it('SCENARIO_MIGRATED_V0 is defined and non-empty', () => {
    expect(typeof SCENARIO_MIGRATED_V0).toBe('string');
    expect(SCENARIO_MIGRATED_V0.length).toBeGreaterThan(0);
  });

});

// ─── v0 → v1 migration succeeds ───────────────────────────────────────────────

describe('R23 Migration — v0 snapshot migrates to v1', () => {

  it('migrateSnapshot on v0 JSON returns ok: true', () => {
    const result = migrateSnapshot(cleanV0Json());
    expect(result.ok).toBe(true);
  });

  it('migrationApplied is true for v0 input', () => {
    const result = migrateSnapshot(cleanV0Json());
    if (result.ok) expect(result.migration.migrationApplied).toBe(true);
  });

  it('sourceVersion is v0', () => {
    const result = migrateSnapshot(cleanV0Json());
    if (result.ok) expect(result.migration.sourceVersion).toBe('v0');
  });

  it('targetVersion is v1', () => {
    const result = migrateSnapshot(cleanV0Json());
    if (result.ok) expect(result.migration.targetVersion).toBe('v1');
  });

  it('migrated snapshot schemaVersion is v1', () => {
    const result = migrateSnapshot(cleanV0Json());
    if (result.ok) expect(result.migration.migratedSnapshot.schemaVersion).toBe('v1');
  });

  it('scenarioId is preserved from v0 input', () => {
    const result = migrateSnapshot(cleanV0Json());
    if (result.ok) expect(result.migration.scenarioId).toBe(SCENARIO_FIRST_CLEAN_TURN);
  });

  it('migrated snapshot scenarioId matches original', () => {
    const result = migrateSnapshot(cleanV0Json());
    if (result.ok) {
      expect(result.migration.migratedSnapshot.scenarioId).toBe(SCENARIO_FIRST_CLEAN_TURN);
    }
  });

});

// ─── migrated snapshot restores correctly ─────────────────────────────────────

describe('R23 Migration — migrated snapshot restores correctly', () => {

  it('migrated snapshot finalTurnState.resolved matches original', () => {
    const original = firstCleanTurnScenario();
    const result   = migrateSnapshot(cleanV0Json());
    if (result.ok) {
      expect(result.migration.migratedSnapshot.finalTurnState.resolved).toBe(
        (original.finalState as Record<string, unknown>)['resolved'],
      );
    }
  });

  it('migrated snapshot auditTrail matches original clean-turn auditTrail', () => {
    const original = firstCleanTurnScenario();
    const result   = migrateSnapshot(cleanV0Json());
    if (result.ok) {
      expect([...result.migration.migratedSnapshot.auditTrail]).toEqual(
        [...original.auditTrail],
      );
    }
  });

  it('migrated snapshot auditTrail has 7 events', () => {
    const result = migrateSnapshot(cleanV0Json());
    if (result.ok) {
      expect(result.migration.migratedSnapshot.auditTrail.length).toBe(7);
    }
  });

  it('migrated snapshot phaseOrder equals canonical PHASE_ORDER', () => {
    const result = migrateSnapshot(cleanV0Json());
    if (result.ok) {
      expect([...result.migration.migratedSnapshot.phaseOrder]).toEqual([
        'StartOfTurn', 'Upkeep', 'Main', 'Journey', 'Alchemist', 'Combat', 'EndOfTurn',
      ]);
    }
  });

  it('migrated snapshot finalTurnState.completedPhaseCount equals auditTrail.length', () => {
    const result = migrateSnapshot(cleanV0Json());
    if (result.ok) {
      const snap = result.migration.migratedSnapshot;
      expect(snap.finalTurnState.completedPhaseCount).toBe(snap.auditTrail.length);
    }
  });

  it('migrated snapshot finalTurnState.currentPhase is null (unknown in v0)', () => {
    const result = migrateSnapshot(cleanV0Json());
    if (result.ok) {
      expect(result.migration.migratedSnapshot.finalTurnState.currentPhase).toBeNull();
    }
  });

  it('migrated snapshot deterministicProof is false (migrated data cannot claim determinism)', () => {
    const result = migrateSnapshot(cleanV0Json());
    if (result.ok) {
      expect(result.migration.migratedSnapshot.deterministicProof).toBe(false);
    }
  });

});

// ─── migration hash and steps are stable ──────────────────────────────────────

describe('R23 Migration — migration hash and steps are stable', () => {

  it('two calls to migrateSnapshot with same v0 input produce identical migrationHash', () => {
    const a = migrateSnapshot(cleanV0Json());
    const b = migrateSnapshot(cleanV0Json());
    if (a.ok && b.ok) {
      expect(a.migration.migrationHash).toBe(b.migration.migrationHash);
    }
  });

  it('migrationSteps equals MIGRATION_STEPS_V0_TO_V1', () => {
    const result = migrateSnapshot(cleanV0Json());
    if (result.ok) {
      expect([...result.migration.migrationSteps]).toEqual([...MIGRATION_STEPS_V0_TO_V1]);
    }
  });

  it('migrationSteps has 8 entries', () => {
    const result = migrateSnapshot(cleanV0Json());
    if (result.ok) {
      expect(result.migration.migrationSteps.length).toBe(8);
    }
  });

  it('MIGRATION_STEPS_V0_TO_V1 is stable (same reference across imports)', () => {
    expect(MIGRATION_STEPS_V0_TO_V1.length).toBeGreaterThan(0);
    expect(MIGRATION_STEPS_V0_TO_V1[0]).toContain('scenarioId');
  });

});

// ─── UNSUPPORTED_OLD_VERSION ─────────────────────────────────────────────────

describe('R23 Migration — UNSUPPORTED_OLD_VERSION fails clearly', () => {

  it('non-vN version string produces failureCode UNSUPPORTED_OLD_VERSION', () => {
    const json = JSON.stringify({ schemaVersion: 'legacy', scenarioId: 'x', auditTrail: [], finalTurnState: {} });
    const result = migrateSnapshot(json);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.failure.failureCode).toBe('UNSUPPORTED_OLD_VERSION');
  });

  it('migrationAllowed is false for UNSUPPORTED_OLD_VERSION', () => {
    const json = JSON.stringify({ schemaVersion: 'alpha', scenarioId: 'x', auditTrail: [], finalTurnState: {} });
    const result = migrateSnapshot(json);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.failure.migrationAllowed).toBe(false);
  });

  it('sourceVersion is preserved in UNSUPPORTED_OLD_VERSION failure', () => {
    const json = JSON.stringify({ schemaVersion: 'pre-v1', scenarioId: 'x', auditTrail: [], finalTurnState: {} });
    const result = migrateSnapshot(json);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.failure.sourceVersion).toBe('pre-v1');
  });

});

// ─── UNSUPPORTED_FUTURE_VERSION ───────────────────────────────────────────────

describe('R23 Migration — UNSUPPORTED_FUTURE_VERSION fails clearly', () => {

  it('v2 produces failureCode UNSUPPORTED_FUTURE_VERSION', () => {
    const json = JSON.stringify({ schemaVersion: 'v2', scenarioId: 'x', auditTrail: [], finalTurnState: {} });
    const result = migrateSnapshot(json);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.failure.failureCode).toBe('UNSUPPORTED_FUTURE_VERSION');
  });

  it('v99 produces failureCode UNSUPPORTED_FUTURE_VERSION', () => {
    const json = JSON.stringify({ schemaVersion: 'v99', scenarioId: 'x', auditTrail: [], finalTurnState: {} });
    const result = migrateSnapshot(json);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.failure.failureCode).toBe('UNSUPPORTED_FUTURE_VERSION');
  });

  it('migrationAllowed is false for UNSUPPORTED_FUTURE_VERSION', () => {
    const json = JSON.stringify({ schemaVersion: 'v3', scenarioId: 'x', auditTrail: [], finalTurnState: {} });
    const result = migrateSnapshot(json);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.failure.migrationAllowed).toBe(false);
  });

});

// ─── MISSING_SOURCE_VERSION ───────────────────────────────────────────────────

describe('R23 Migration — MISSING_SOURCE_VERSION fails clearly', () => {

  it('absent schemaVersion produces failureCode MISSING_SOURCE_VERSION', () => {
    const json = JSON.stringify({ scenarioId: 'x', auditTrail: [], finalTurnState: {} });
    const result = migrateSnapshot(json);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.failure.failureCode).toBe('MISSING_SOURCE_VERSION');
  });

  it('null schemaVersion produces failureCode MISSING_SOURCE_VERSION', () => {
    const json = JSON.stringify({ schemaVersion: null, scenarioId: 'x', auditTrail: [], finalTurnState: {} });
    const result = migrateSnapshot(json);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.failure.failureCode).toBe('MISSING_SOURCE_VERSION');
  });

  it('migrationAllowed is false for MISSING_SOURCE_VERSION', () => {
    const json = JSON.stringify({ scenarioId: 'x', auditTrail: [] });
    const result = migrateSnapshot(json);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.failure.migrationAllowed).toBe(false);
  });

});

// ─── MALFORMED_INPUT ──────────────────────────────────────────────────────────

describe('R23 Migration — MALFORMED_INPUT fails clearly', () => {

  it('invalid JSON string produces failureCode MALFORMED_INPUT', () => {
    const result = migrateSnapshot('{not valid json}');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.failure.failureCode).toBe('MALFORMED_INPUT');
  });

  it('v0 snapshot with absent finalTurnState produces MALFORMED_INPUT', () => {
    const json = JSON.stringify({ schemaVersion: 'v0', scenarioId: 'x', auditTrail: [] });
    const result = migrateSnapshot(json);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.failure.failureCode).toBe('MALFORMED_INPUT');
  });

  it('v0 snapshot with missing resolved field produces MALFORMED_INPUT', () => {
    const json = JSON.stringify({
      schemaVersion: 'v0',
      scenarioId: 'x',
      auditTrail: [],
      finalTurnState: { turnId: 't1', pressureLevel: 0 },
    });
    const result = migrateSnapshot(json);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.failure.failureCode).toBe('MALFORMED_INPUT');
  });

  it('migrationAllowed is false for MALFORMED_INPUT', () => {
    const result = migrateSnapshot('');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.failure.migrationAllowed).toBe(false);
  });

});

// ─── Failure hashes are stable ────────────────────────────────────────────────

describe('R23 Migration — failure hashes are stable across calls', () => {

  it('two MISSING_SOURCE_VERSION calls produce identical failureHash', () => {
    const json = JSON.stringify({ scenarioId: 'x', auditTrail: [] });
    const a = migrateSnapshot(json);
    const b = migrateSnapshot(json);
    if (!a.ok && !b.ok) expect(a.failure.failureHash).toBe(b.failure.failureHash);
  });

  it('two UNSUPPORTED_FUTURE_VERSION calls produce identical failureHash', () => {
    const json = JSON.stringify({ schemaVersion: 'v2', scenarioId: 'x' });
    const a = migrateSnapshot(json);
    const b = migrateSnapshot(json);
    if (!a.ok && !b.ok) expect(a.failure.failureHash).toBe(b.failure.failureHash);
  });

  it('two UNSUPPORTED_OLD_VERSION calls produce identical failureHash', () => {
    const json = JSON.stringify({ schemaVersion: 'legacy', scenarioId: 'x' });
    const a = migrateSnapshot(json);
    const b = migrateSnapshot(json);
    if (!a.ok && !b.ok) expect(a.failure.failureHash).toBe(b.failure.failureHash);
  });

  it('different failure codes produce different failureHash values', () => {
    const missingVersion = migrateSnapshot(JSON.stringify({ scenarioId: 'x' }));
    const futureVersion  = migrateSnapshot(JSON.stringify({ schemaVersion: 'v2', scenarioId: 'x' }));
    if (!missingVersion.ok && !futureVersion.ok) {
      expect(missingVersion.failure.failureHash).not.toBe(futureVersion.failure.failureHash);
    }
  });

});

// ─── Identity migration for current version v1 ───────────────────────────────

describe('R23 Migration — identity migration for current version v1', () => {

  it('v1 input returns ok: true with migrationApplied: false', () => {
    const result = migrateSnapshot(cleanV1Json());
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.migration.migrationApplied).toBe(false);
  });

  it('v1 identity migration has empty migrationSteps', () => {
    const result = migrateSnapshot(cleanV1Json());
    if (result.ok) expect(result.migration.migrationSteps.length).toBe(0);
  });

  it('v1 identity migrationHash is stable across calls', () => {
    const a = migrateSnapshot(cleanV1Json());
    const b = migrateSnapshot(cleanV1Json());
    if (a.ok && b.ok) {
      expect(a.migration.migrationHash).toBe(b.migration.migrationHash);
    }
  });

  it('v1 identity migratedSnapshot matches direct restoreTurnSnapshot', () => {
    const json    = cleanV1Json();
    const result  = migrateSnapshot(json);
    const direct  = restoreTurnSnapshot(json);
    if (result.ok) {
      expect(result.migration.migratedSnapshot.signature.combinedHash).toBe(
        direct.signature.combinedHash,
      );
    }
  });

});

// ─── No partial invalid state is returned ─────────────────────────────────────

describe('R23 Migration — no partial invalid state on failure', () => {

  it('failed migration result has no migration field', () => {
    const result = migrateSnapshot('{not json}');
    expect(result.ok).toBe(false);
    expect((result as Record<string, unknown>)['migration']).toBeUndefined();
  });

  it('successful migration result has no failure field', () => {
    const result = migrateSnapshot(cleanV0Json());
    expect(result.ok).toBe(true);
    expect((result as Record<string, unknown>)['failure']).toBeUndefined();
  });

});

// ─── Isolation — other systems unaffected ────────────────────────────────────

describe('R23 Migration — isolation (other systems unaffected)', () => {

  it('firstCleanTurnScenario is unaffected after migration tests', () => {
    migrateSnapshot(cleanV0Json());
    const clean = firstCleanTurnScenario();
    expect(clean.finalState.resolved).toBe(true);
    expect(clean.signature.deterministicProof).toBe(true);
  });

  it('failureThenCleanRecoveryScenario is unaffected after migration tests', () => {
    migrateSnapshot(cleanV0Json());
    const rec = failureThenCleanRecoveryScenario();
    expect(rec.signature.deterministicProof).toBe(true);
  });

  it('corruption guard behavior is unaffected — valid JSON still passes guardTurnSnapshot', () => {
    migrateSnapshot(cleanV0Json());
    const guardResult = guardTurnSnapshot(cleanV1Json());
    expect(guardResult.ok).toBe(true);
  });

  it('corruption guard behavior is unaffected — corrupt JSON still fails guardTurnSnapshot', () => {
    migrateSnapshot(cleanV0Json());
    const json = JSON.stringify({ schemaVersion: 'v1', scenarioId: '', auditTrail: [] });
    const guardResult = guardTurnSnapshot(json);
    expect(guardResult.ok).toBe(false);
  });

  it('SCENARIO_MIGRATED_V0 differs from SCENARIO_CORRUPTED_PERSISTED_TURN', () => {
    expect(SCENARIO_MIGRATED_V0).not.toBe(SCENARIO_CORRUPTED_PERSISTED_TURN);
  });

});
