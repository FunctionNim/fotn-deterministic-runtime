/**
 * R15 — Replay Audit Fixture tests.
 *
 * Proves:
 *   1. Audit fixture fields are structurally complete
 *   2. same scenario → same audit facts (determinism)
 *   3. same scenario → same auditHash
 *   4. same scenario → same combinedHash
 *   5. Audit event order is stable
 *   6. First and last audit events are stable
 *   7. auditHash and combinedHash agree with the live signature
 *   8. Registry metadata agrees with audit fixture facts
 *   9. Forced-failure audit intentionally differs from normal Act I
 *  10. Unknown ID fails clearly
 *  11. getAllAuditFixtures returns all scenarios
 *  12. deterministicProof is true for every registered scenario
 */

import { describe, it, expect } from 'vitest';
import {
  buildAuditFixture,
  getAllAuditFixtures,
  AuditFixture,
} from '../../src/replay-audit/replay-audit-fixture.js';
import {
  getAllScenarios,
  runScenario,
} from '../../src/scenario-registry/scenario-registry.js';
import {
  SCENARIO_ACT_I_STONE_ROOM,
  SCENARIO_ACT_I_FORCED_FAILURE,
  SCENARIO_ACT_II_FIRST_LOOP,
} from '../../src/replay/scenarios.js';

const ALL_IDS = [
  SCENARIO_ACT_I_STONE_ROOM,
  SCENARIO_ACT_I_FORCED_FAILURE,
  SCENARIO_ACT_II_FIRST_LOOP,
];

// ─── Structural completeness ───────────────────────────────────────────────────

describe('R15 Audit Fixture — structural completeness', () => {

  it('every required field is present and typed correctly for all scenarios', () => {
    for (const id of ALL_IDS) {
      const fix = buildAuditFixture(id);
      expect(typeof fix.scenarioId).toBe('string');
      expect(typeof fix.auditEventCount).toBe('number');
      expect(Array.isArray(fix.auditEvents)).toBe(true);
      expect(Array.isArray(fix.auditEventTypes)).toBe(true);
      // firstAuditEvent / lastAuditEvent: string or null
      expect(fix.firstAuditEvent === null || typeof fix.firstAuditEvent === 'string').toBe(true);
      expect(fix.lastAuditEvent === null || typeof fix.lastAuditEvent === 'string').toBe(true);
      expect(typeof fix.auditHash).toBe('string');
      expect(typeof fix.signatureCombinedHash).toBe('string');
      expect(typeof fix.finalStateSummary).toBe('object');
      expect(typeof fix.deterministicProof).toBe('boolean');
    }
  });

  it('auditEventCount equals auditEvents.length for all scenarios', () => {
    for (const id of ALL_IDS) {
      const fix = buildAuditFixture(id);
      expect(fix.auditEventCount).toBe(fix.auditEvents.length);
    }
  });

  it('auditEventCount is greater than zero for all registered scenarios', () => {
    for (const id of ALL_IDS) {
      const fix = buildAuditFixture(id);
      expect(fix.auditEventCount).toBeGreaterThan(0);
    }
  });

  it('scenarioId in fixture matches the requested ID', () => {
    for (const id of ALL_IDS) {
      expect(buildAuditFixture(id).scenarioId).toBe(id);
    }
  });

  it('auditEventTypes is a sorted subset of auditEvents (no extras)', () => {
    for (const id of ALL_IDS) {
      const fix = buildAuditFixture(id);
      const set = new Set(fix.auditEvents);
      for (const t of fix.auditEventTypes) {
        expect(set.has(t)).toBe(true);
      }
      // sorted
      const sorted = [...fix.auditEventTypes].sort();
      expect([...fix.auditEventTypes]).toEqual(sorted);
    }
  });

});

// ─── Determinism ───────────────────────────────────────────────────────────────

describe('R15 Audit Fixture — same scenario → same audit facts', () => {

  it('two calls produce identical auditEvents arrays', () => {
    for (const id of ALL_IDS) {
      const a = buildAuditFixture(id);
      const b = buildAuditFixture(id);
      expect([...a.auditEvents]).toEqual([...b.auditEvents]);
    }
  });

  it('two calls produce identical auditHash', () => {
    for (const id of ALL_IDS) {
      const a = buildAuditFixture(id);
      const b = buildAuditFixture(id);
      expect(a.auditHash).toBe(b.auditHash);
    }
  });

  it('two calls produce identical signatureCombinedHash', () => {
    for (const id of ALL_IDS) {
      const a = buildAuditFixture(id);
      const b = buildAuditFixture(id);
      expect(a.signatureCombinedHash).toBe(b.signatureCombinedHash);
    }
  });

  it('two calls produce identical firstAuditEvent and lastAuditEvent', () => {
    for (const id of ALL_IDS) {
      const a = buildAuditFixture(id);
      const b = buildAuditFixture(id);
      expect(a.firstAuditEvent).toBe(b.firstAuditEvent);
      expect(a.lastAuditEvent).toBe(b.lastAuditEvent);
    }
  });

  it('two calls produce identical finalStateSummary', () => {
    for (const id of ALL_IDS) {
      const a = buildAuditFixture(id);
      const b = buildAuditFixture(id);
      expect(a.finalStateSummary).toEqual(b.finalStateSummary);
    }
  });

});

// ─── Hash agreement with live signature ────────────────────────────────────────

describe('R15 Audit Fixture — hash fields agree with live signature', () => {

  it('auditHash matches signature.auditHash from a live runScenario call', () => {
    for (const id of ALL_IDS) {
      const fix = buildAuditFixture(id);
      const live = runScenario(id);
      expect(fix.auditHash).toBe(live.signature.auditHash);
    }
  });

  it('signatureCombinedHash matches signature.combinedHash from a live runScenario call', () => {
    for (const id of ALL_IDS) {
      const fix = buildAuditFixture(id);
      const live = runScenario(id);
      expect(fix.signatureCombinedHash).toBe(live.signature.combinedHash);
    }
  });

  it('firstAuditEvent matches auditTrail[0] from a live runScenario call', () => {
    for (const id of ALL_IDS) {
      const fix = buildAuditFixture(id);
      const live = runScenario(id);
      expect(fix.firstAuditEvent).toBe(live.auditTrail[0]);
    }
  });

  it('lastAuditEvent matches auditTrail[last] from a live runScenario call', () => {
    for (const id of ALL_IDS) {
      const fix = buildAuditFixture(id);
      const live = runScenario(id);
      const lastIdx = live.auditTrail.length - 1;
      expect(fix.lastAuditEvent).toBe(live.auditTrail[lastIdx]);
    }
  });

});

// ─── Registry metadata agreement ──────────────────────────────────────────────

describe('R15 Audit Fixture — registry metadata agreement', () => {

  it('deterministicProof is true for every registered scenario', () => {
    for (const meta of getAllScenarios()) {
      const fix = buildAuditFixture(meta.id);
      expect(fix.deterministicProof).toBe(true);
    }
  });

  it('Act I stone room: auditEventCount is 18 (17 actions + 1 ledger close record)', () => {
    const fix = buildAuditFixture(SCENARIO_ACT_I_STONE_ROOM);
    expect(fix.auditEventCount).toBe(18);
  });

  it('Act I forced failure: auditEventCount is 2 (EnterRoom + ForceBreak witness records)', () => {
    const fix = buildAuditFixture(SCENARIO_ACT_I_FORCED_FAILURE);
    expect(fix.auditEventCount).toBe(2);
  });

});

// ─── Forced failure vs normal Act I ───────────────────────────────────────────

describe('R15 Audit Fixture — forced-failure audit intentionally differs from normal Act I', () => {

  it('forced-failure has fewer audit events than normal Act I', () => {
    const normal = buildAuditFixture(SCENARIO_ACT_I_STONE_ROOM);
    const forced = buildAuditFixture(SCENARIO_ACT_I_FORCED_FAILURE);
    expect(forced.auditEventCount).toBeLessThan(normal.auditEventCount);
  });

  it('forced-failure auditHash differs from normal Act I auditHash', () => {
    const normal = buildAuditFixture(SCENARIO_ACT_I_STONE_ROOM);
    const forced = buildAuditFixture(SCENARIO_ACT_I_FORCED_FAILURE);
    expect(forced.auditHash).not.toBe(normal.auditHash);
  });

  it('forced-failure signatureCombinedHash differs from normal Act I', () => {
    const normal = buildAuditFixture(SCENARIO_ACT_I_STONE_ROOM);
    const forced = buildAuditFixture(SCENARIO_ACT_I_FORCED_FAILURE);
    expect(forced.signatureCombinedHash).not.toBe(normal.signatureCombinedHash);
  });

  it('forced-failure lastAuditEvent differs from normal Act I lastAuditEvent', () => {
    const normal = buildAuditFixture(SCENARIO_ACT_I_STONE_ROOM);
    const forced = buildAuditFixture(SCENARIO_ACT_I_FORCED_FAILURE);
    expect(forced.lastAuditEvent).not.toBe(normal.lastAuditEvent);
  });

});

// ─── Error handling ────────────────────────────────────────────────────────────

describe('R15 Audit Fixture — error handling', () => {

  it('buildAuditFixture throws a clear error for an unknown scenario ID', () => {
    expect(() => buildAuditFixture('does-not-exist')).toThrowError(
      /unknown id 'does-not-exist'/,
    );
  });

});

// ─── getAllAuditFixtures ────────────────────────────────────────────────────────

describe('R15 Audit Fixture — getAllAuditFixtures', () => {

  it('returns an AuditFixture for every registered scenario', () => {
    const fixtures = getAllAuditFixtures();
    expect(fixtures.length).toBe(5);
    for (const id of ALL_IDS) {
      expect(fixtures.map((f) => f.scenarioId)).toContain(id);
    }
  });

  it('returns fixtures sorted by scenario ID', () => {
    const fixtures = getAllAuditFixtures();
    const ids = fixtures.map((f) => f.scenarioId);
    expect(ids).toEqual([...ids].sort());
  });

  it('each fixture returned by getAllAuditFixtures has a non-empty auditEvents array', () => {
    for (const fix of getAllAuditFixtures()) {
      expect(fix.auditEvents.length).toBeGreaterThan(0);
    }
  });

});
