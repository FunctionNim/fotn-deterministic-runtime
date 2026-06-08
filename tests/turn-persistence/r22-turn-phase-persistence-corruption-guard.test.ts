/**
 * R22 — Turn Phase Persistence Corruption Guard tests.
 *
 * Proves that malformed, corrupted, missing-field, wrong-version, or tampered
 * turn snapshots fail safely with stable error codes, without restoring partial
 * invalid state or poisoning later valid restore/replay paths.
 *
 * Corruption scenario ID: turn-pipeline:persisted-clean-turn:corrupted
 *
 * Guarantees proved:
 *   - Each corruption case produces the expected failureCode
 *   - failureCode and failureHash are stable across repeated calls
 *   - restoreAllowed is always false for invalid snapshots
 *   - No partial invalid state is returned on failure
 *   - Valid persisted-clean-turn still restores successfully after corruption tests
 *   - Valid recovery scenario remains unaffected
 *   - Object key order does not affect corruption validation
 *   - Array order remains significant (wrong phaseOrder → PHASE_ORDER_CHANGED)
 */

import { describe, it, expect } from 'vitest';
import {
  SCENARIO_CORRUPTED_PERSISTED_TURN,
  guardTurnSnapshot,
} from '../../src/turn-persistence/turn-corruption-guard.js';
import {
  serializeTurnResult,
  restoreTurnSnapshot,
  SCENARIO_PERSISTED_CLEAN_TURN,
} from '../../src/turn-persistence/turn-persistence.js';
import {
  SCENARIO_FIRST_CLEAN_TURN,
  firstCleanTurnScenario,
  failureThenCleanRecoveryScenario,
} from '../../src/turn-pipeline/turn-pipeline.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Return a valid serialized snapshot of the first clean turn. */
function validJson(): string {
  return serializeTurnResult(firstCleanTurnScenario());
}

/** Parse valid JSON and apply a mutation, return the re-stringified result. */
function corrupt(mutate: (raw: Record<string, unknown>) => void): string {
  const raw = JSON.parse(validJson()) as Record<string, unknown>;
  mutate(raw);
  return JSON.stringify(raw);
}

// ─── WRONG_SCHEMA_VERSION ─────────────────────────────────────────────────────

describe('R22 Corruption Guard — WRONG_SCHEMA_VERSION', () => {

  it('wrong version string produces failureCode WRONG_SCHEMA_VERSION', () => {
    const json = corrupt(r => { r['schemaVersion'] = 'v2'; });
    const result = guardTurnSnapshot(json);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.failure.failureCode).toBe('WRONG_SCHEMA_VERSION');
  });

  it('null schemaVersion produces failureCode WRONG_SCHEMA_VERSION', () => {
    const json = corrupt(r => { r['schemaVersion'] = null; });
    const result = guardTurnSnapshot(json);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.failure.failureCode).toBe('WRONG_SCHEMA_VERSION');
  });

  it('corruptedField is schemaVersion', () => {
    const json = corrupt(r => { r['schemaVersion'] = 'v99'; });
    const result = guardTurnSnapshot(json);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.failure.corruptedField).toBe('schemaVersion');
  });

  it('restoreAllowed is false', () => {
    const json = corrupt(r => { r['schemaVersion'] = 'v0'; });
    const result = guardTurnSnapshot(json);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.failure.restoreAllowed).toBe(false);
  });

});

// ─── MISSING_SCENARIO_ID ─────────────────────────────────────────────────────

describe('R22 Corruption Guard — MISSING_SCENARIO_ID', () => {

  it('absent scenarioId produces failureCode MISSING_SCENARIO_ID', () => {
    const json = corrupt(r => { delete r['scenarioId']; });
    const result = guardTurnSnapshot(json);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.failure.failureCode).toBe('MISSING_SCENARIO_ID');
  });

  it('empty string scenarioId produces failureCode MISSING_SCENARIO_ID', () => {
    const json = corrupt(r => { r['scenarioId'] = ''; });
    const result = guardTurnSnapshot(json);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.failure.failureCode).toBe('MISSING_SCENARIO_ID');
  });

  it('corruptedField is scenarioId', () => {
    const json = corrupt(r => { delete r['scenarioId']; });
    const result = guardTurnSnapshot(json);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.failure.corruptedField).toBe('scenarioId');
  });

  it('restoreAllowed is false', () => {
    const json = corrupt(r => { r['scenarioId'] = ''; });
    const result = guardTurnSnapshot(json);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.failure.restoreAllowed).toBe(false);
  });

});

// ─── MISSING_RUNTIME_SIGNATURE ────────────────────────────────────────────────

describe('R22 Corruption Guard — MISSING_RUNTIME_SIGNATURE', () => {

  it('absent signature produces failureCode MISSING_RUNTIME_SIGNATURE', () => {
    const json = corrupt(r => { delete r['signature']; });
    const result = guardTurnSnapshot(json);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.failure.failureCode).toBe('MISSING_RUNTIME_SIGNATURE');
  });

  it('null signature produces failureCode MISSING_RUNTIME_SIGNATURE', () => {
    const json = corrupt(r => { r['signature'] = null; });
    const result = guardTurnSnapshot(json);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.failure.failureCode).toBe('MISSING_RUNTIME_SIGNATURE');
  });

  it('missing combinedHash inside signature produces MISSING_RUNTIME_SIGNATURE', () => {
    const json = corrupt(r => {
      const sig = r['signature'] as Record<string, unknown>;
      delete sig['combinedHash'];
    });
    const result = guardTurnSnapshot(json);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.failure.failureCode).toBe('MISSING_RUNTIME_SIGNATURE');
  });

  it('restoreAllowed is false', () => {
    const json = corrupt(r => { delete r['signature']; });
    const result = guardTurnSnapshot(json);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.failure.restoreAllowed).toBe(false);
  });

});

// ─── TAMPERED_FINAL_STATE ────────────────────────────────────────────────────

describe('R22 Corruption Guard — TAMPERED_FINAL_STATE', () => {

  it('absent finalTurnState produces failureCode TAMPERED_FINAL_STATE', () => {
    const json = corrupt(r => { delete r['finalTurnState']; });
    const result = guardTurnSnapshot(json);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.failure.failureCode).toBe('TAMPERED_FINAL_STATE');
  });

  it('null finalTurnState produces failureCode TAMPERED_FINAL_STATE', () => {
    const json = corrupt(r => { r['finalTurnState'] = null; });
    const result = guardTurnSnapshot(json);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.failure.failureCode).toBe('TAMPERED_FINAL_STATE');
  });

  it('missing resolved field inside finalTurnState produces TAMPERED_FINAL_STATE', () => {
    const json = corrupt(r => {
      const fts = r['finalTurnState'] as Record<string, unknown>;
      delete fts['resolved'];
    });
    const result = guardTurnSnapshot(json);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.failure.failureCode).toBe('TAMPERED_FINAL_STATE');
  });

  it('restoreAllowed is false', () => {
    const json = corrupt(r => { r['finalTurnState'] = null; });
    const result = guardTurnSnapshot(json);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.failure.restoreAllowed).toBe(false);
  });

});

// ─── PHASE_ORDER_CHANGED ─────────────────────────────────────────────────────

describe('R22 Corruption Guard — PHASE_ORDER_CHANGED', () => {

  it('absent phaseOrder produces failureCode PHASE_ORDER_CHANGED', () => {
    const json = corrupt(r => { delete r['phaseOrder']; });
    const result = guardTurnSnapshot(json);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.failure.failureCode).toBe('PHASE_ORDER_CHANGED');
  });

  it('truncated phaseOrder produces failureCode PHASE_ORDER_CHANGED', () => {
    const json = corrupt(r => { r['phaseOrder'] = ['StartOfTurn', 'Upkeep']; });
    const result = guardTurnSnapshot(json);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.failure.failureCode).toBe('PHASE_ORDER_CHANGED');
  });

  it('reversed phaseOrder produces failureCode PHASE_ORDER_CHANGED', () => {
    const json = corrupt(r => {
      r['phaseOrder'] = (r['phaseOrder'] as string[]).slice().reverse();
    });
    const result = guardTurnSnapshot(json);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.failure.failureCode).toBe('PHASE_ORDER_CHANGED');
  });

  it('restoreAllowed is false', () => {
    const json = corrupt(r => { r['phaseOrder'] = []; });
    const result = guardTurnSnapshot(json);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.failure.restoreAllowed).toBe(false);
  });

});

// ─── AUDIT_TRAIL_CHANGED ─────────────────────────────────────────────────────

describe('R22 Corruption Guard — AUDIT_TRAIL_CHANGED', () => {

  it('absent auditTrail produces failureCode AUDIT_TRAIL_CHANGED', () => {
    const json = corrupt(r => { delete r['auditTrail']; });
    const result = guardTurnSnapshot(json);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.failure.failureCode).toBe('AUDIT_TRAIL_CHANGED');
  });

  it('null auditTrail produces failureCode AUDIT_TRAIL_CHANGED', () => {
    const json = corrupt(r => { r['auditTrail'] = null; });
    const result = guardTurnSnapshot(json);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.failure.failureCode).toBe('AUDIT_TRAIL_CHANGED');
  });

  it('empty auditTrail array produces failureCode AUDIT_TRAIL_CHANGED', () => {
    const json = corrupt(r => { r['auditTrail'] = []; });
    const result = guardTurnSnapshot(json);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.failure.failureCode).toBe('AUDIT_TRAIL_CHANGED');
  });

  it('restoreAllowed is false', () => {
    const json = corrupt(r => { delete r['auditTrail']; });
    const result = guardTurnSnapshot(json);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.failure.restoreAllowed).toBe(false);
  });

});

// ─── Failure hashes are stable ────────────────────────────────────────────────

describe('R22 Corruption Guard — failure hashes are stable across calls', () => {

  it('two calls for same WRONG_SCHEMA_VERSION corruption produce identical failureHash', () => {
    const json = corrupt(r => { r['schemaVersion'] = 'v2'; });
    const a = guardTurnSnapshot(json);
    const b = guardTurnSnapshot(json);
    expect(a.ok).toBe(false);
    expect(b.ok).toBe(false);
    if (!a.ok && !b.ok) expect(a.failure.failureHash).toBe(b.failure.failureHash);
  });

  it('two calls for same MISSING_SCENARIO_ID corruption produce identical failureHash', () => {
    const json = corrupt(r => { delete r['scenarioId']; });
    const a = guardTurnSnapshot(json);
    const b = guardTurnSnapshot(json);
    expect(a.ok).toBe(false);
    expect(b.ok).toBe(false);
    if (!a.ok && !b.ok) expect(a.failure.failureHash).toBe(b.failure.failureHash);
  });

  it('two calls for same PHASE_ORDER_CHANGED corruption produce identical failureHash', () => {
    const json = corrupt(r => {
      r['phaseOrder'] = (r['phaseOrder'] as string[]).slice().reverse();
    });
    const a = guardTurnSnapshot(json);
    const b = guardTurnSnapshot(json);
    expect(a.ok).toBe(false);
    expect(b.ok).toBe(false);
    if (!a.ok && !b.ok) expect(a.failure.failureHash).toBe(b.failure.failureHash);
  });

  it('different corruption cases produce different failureHash values', () => {
    const wrongVersion  = guardTurnSnapshot(corrupt(r => { r['schemaVersion'] = 'v2'; }));
    const missingId     = guardTurnSnapshot(corrupt(r => { delete r['scenarioId']; }));
    expect(wrongVersion.ok).toBe(false);
    expect(missingId.ok).toBe(false);
    if (!wrongVersion.ok && !missingId.ok) {
      expect(wrongVersion.failure.failureHash).not.toBe(missingId.failure.failureHash);
    }
  });

});

// ─── restoreAllowed is always false ──────────────────────────────────────────

describe('R22 Corruption Guard — restoreAllowed is always false for invalid snapshots', () => {

  it('every corruption case sets restoreAllowed to false', () => {
    const cases = [
      corrupt(r => { r['schemaVersion'] = 'v99'; }),
      corrupt(r => { delete r['scenarioId']; }),
      corrupt(r => { delete r['signature']; }),
      corrupt(r => { delete r['finalTurnState']; }),
      corrupt(r => { delete r['phaseOrder']; }),
      corrupt(r => { delete r['auditTrail']; }),
    ];
    for (const json of cases) {
      const result = guardTurnSnapshot(json);
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.failure.restoreAllowed).toBe(false);
    }
  });

  it('SCENARIO_CORRUPTED_PERSISTED_TURN is defined and not empty', () => {
    expect(typeof SCENARIO_CORRUPTED_PERSISTED_TURN).toBe('string');
    expect(SCENARIO_CORRUPTED_PERSISTED_TURN.length).toBeGreaterThan(0);
  });

});

// ─── No partial invalid state is restored ────────────────────────────────────

describe('R22 Corruption Guard — no partial invalid state is restored', () => {

  it('failed guard result has no snapshot field', () => {
    const json = corrupt(r => { delete r['finalTurnState']; });
    const result = guardTurnSnapshot(json);
    expect(result.ok).toBe(false);
    expect((result as Record<string, unknown>)['snapshot']).toBeUndefined();
  });

  it('successful guard result has no failure field', () => {
    const result = guardTurnSnapshot(validJson());
    expect(result.ok).toBe(true);
    expect((result as Record<string, unknown>)['failure']).toBeUndefined();
  });

});

// ─── Valid snapshot passes guard ─────────────────────────────────────────────

describe('R22 Corruption Guard — valid snapshot passes guard', () => {

  it('valid serialized firstCleanTurnScenario passes guard (ok: true)', () => {
    const result = guardTurnSnapshot(validJson());
    expect(result.ok).toBe(true);
  });

  it('restored snapshot has deterministicProof: true', () => {
    const result = guardTurnSnapshot(validJson());
    if (result.ok) expect(result.snapshot.deterministicProof).toBe(true);
  });

  it('restored snapshot scenarioId is SCENARIO_FIRST_CLEAN_TURN', () => {
    const result = guardTurnSnapshot(validJson());
    if (result.ok) expect(result.snapshot.scenarioId).toBe(SCENARIO_FIRST_CLEAN_TURN);
  });

  it('guard result snapshot equals direct restoreTurnSnapshot result', () => {
    const json = validJson();
    const guardResult  = guardTurnSnapshot(json);
    const directResult = restoreTurnSnapshot(json);
    if (guardResult.ok) {
      expect(guardResult.snapshot.signature.combinedHash).toBe(
        directResult.signature.combinedHash,
      );
    }
  });

  it('two calls to guardTurnSnapshot on valid JSON return identical combinedHash', () => {
    const a = guardTurnSnapshot(validJson());
    const b = guardTurnSnapshot(validJson());
    if (a.ok && b.ok) {
      expect(a.snapshot.signature.combinedHash).toBe(b.snapshot.signature.combinedHash);
    }
  });

});

// ─── Key order does not affect validation ─────────────────────────────────────

describe('R22 Corruption Guard — key order does not affect validation', () => {

  it('reversed top-level key order in valid JSON still passes guard', () => {
    const parsed  = JSON.parse(validJson()) as Record<string, unknown>;
    const reversed = Object.fromEntries(Object.entries(parsed).reverse());
    const result  = guardTurnSnapshot(JSON.stringify(reversed));
    expect(result.ok).toBe(true);
  });

  it('corrupt snapshot with reversed key order still fails with correct failureCode', () => {
    const parsed = JSON.parse(validJson()) as Record<string, unknown>;
    delete parsed['scenarioId'];
    const reversed = Object.fromEntries(Object.entries(parsed).reverse());
    const result  = guardTurnSnapshot(JSON.stringify(reversed));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.failure.failureCode).toBe('MISSING_SCENARIO_ID');
  });

});

// ─── Array order remains significant ─────────────────────────────────────────

describe('R22 Corruption Guard — array order remains significant', () => {

  it('reversed phaseOrder is rejected (wrong entry at index 0)', () => {
    const json = corrupt(r => {
      r['phaseOrder'] = (r['phaseOrder'] as string[]).slice().reverse();
    });
    const result = guardTurnSnapshot(json);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.failure.failureCode).toBe('PHASE_ORDER_CHANGED');
      expect(result.failure.corruptedField).toMatch(/phaseOrder/);
    }
  });

  it('a single wrong entry in phaseOrder is rejected at the correct index', () => {
    const json = corrupt(r => {
      const po = (r['phaseOrder'] as string[]).slice();
      po[2] = 'Combat'; // Wrong — should be 'Main'
      r['phaseOrder'] = po;
    });
    const result = guardTurnSnapshot(json);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.failure.failureCode).toBe('PHASE_ORDER_CHANGED');
      expect(result.failure.corruptedField).toBe('phaseOrder[2]');
    }
  });

});

// ─── Isolation — other scenarios unaffected ───────────────────────────────────

describe('R22 Corruption Guard — other scenarios unaffected', () => {

  it('firstCleanTurnScenario is unaffected after corruption tests', () => {
    guardTurnSnapshot(corrupt(r => { delete r['signature']; }));
    const clean = firstCleanTurnScenario();
    expect(clean.finalState.resolved).toBe(true);
    expect(clean.signature.deterministicProof).toBe(true);
  });

  it('failureThenCleanRecoveryScenario is unaffected after corruption tests', () => {
    guardTurnSnapshot(corrupt(r => { r['schemaVersion'] = 'v0'; }));
    const rec = failureThenCleanRecoveryScenario();
    expect(rec.signature.deterministicProof).toBe(true);
  });

  it('SCENARIO_CORRUPTED_PERSISTED_TURN differs from SCENARIO_PERSISTED_CLEAN_TURN', () => {
    expect(SCENARIO_CORRUPTED_PERSISTED_TURN).not.toBe(SCENARIO_PERSISTED_CLEAN_TURN);
  });

  it('valid guard result combinedHash matches serialized firstCleanTurnScenario', () => {
    const original = firstCleanTurnScenario();
    const result   = guardTurnSnapshot(serializeTurnResult(original));
    if (result.ok) {
      expect(result.snapshot.signature.combinedHash).toBe(original.signature.combinedHash);
    }
  });

});
