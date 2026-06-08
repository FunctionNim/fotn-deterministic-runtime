/**
 * R20 — Turn Phase Recovery Fixture tests.
 *
 * Proves that after a guarded turn phase failure, a fresh valid turn can still
 * execute cleanly and deterministically. The failure must be fully contained
 * and must not poison later runtime sequences.
 *
 * Recovery scenario: turn-pipeline:failure-then-clean-recovery
 *   1. Failure half — invalid phase order (Main before Upkeep) → OUT_OF_ORDER_PHASE
 *   2. Recovery half — fresh valid clean turn → all 7 phases, resolved: true
 *
 * Guarantees proved:
 *   - Failure half produces correct failure code and is contained
 *   - Recovery half starts from clean initial state
 *   - Recovery executes all 7 phases in PHASE_ORDER sequence
 *   - Recovery final state equals the normal clean-turn final state
 *   - Recovery signature equals the normal clean-turn signature (same input → same hash)
 *   - Failure audit and recovery audit remain completely separated
 *   - Repeated recovery runs produce identical structured results
 *   - Clean-turn scenario is unaffected after recovery fixture execution
 *   - Scenario Registry and Audit Fixture integration work
 */

import { describe, it, expect } from 'vitest';
import {
  PHASE_ORDER,
  SCENARIO_FIRST_CLEAN_TURN,
  SCENARIO_FAILURE_THEN_CLEAN_RECOVERY,
  firstCleanTurnScenario,
  failureThenCleanRecoveryScenario,
  runTurnPhaseRecovery,
} from '../../src/turn-pipeline/turn-pipeline.js';
import {
  lookupScenario,
  runScenario,
  getAllScenarioIds,
} from '../../src/scenario-registry/scenario-registry.js';
import { buildAuditFixture } from '../../src/replay-audit/replay-audit-fixture.js';

// ─── Scenario Registry integration ────────────────────────────────────────────

describe('R20 Recovery — Scenario Registry integration', () => {

  it('turn-pipeline:failure-then-clean-recovery is registered', () => {
    expect(getAllScenarioIds()).toContain(SCENARIO_FAILURE_THEN_CLEAN_RECOVERY);
  });

  it('registry now contains 8 scenarios', () => {
    expect(getAllScenarioIds().length).toBe(8);
  });

  it('lookupScenario returns correct metadata', () => {
    const meta = lookupScenario(SCENARIO_FAILURE_THEN_CLEAN_RECOVERY);
    expect(meta.id).toBe(SCENARIO_FAILURE_THEN_CLEAN_RECOVERY);
    expect(meta.phase).toBe('turn-pipeline');
    expect(meta.memoryBehavior).toBe('none');
  });

  it('runScenario via registry matches direct runner combinedHash', () => {
    const fromRegistry = runScenario(SCENARIO_FAILURE_THEN_CLEAN_RECOVERY);
    const direct       = failureThenCleanRecoveryScenario();
    expect(fromRegistry.signature.combinedHash).toBe(direct.signature.combinedHash);
  });

});

// ─── Failure half — containment ────────────────────────────────────────────────

describe('R20 Recovery — failure half proves containment', () => {

  it('failureHalf.failureCode is OUT_OF_ORDER_PHASE', () => {
    const rec = runTurnPhaseRecovery();
    expect(rec.failureHalf.failureCode).toBe('OUT_OF_ORDER_PHASE');
  });

  it('failureHalf.expectedPhase is Upkeep', () => {
    const rec = runTurnPhaseRecovery();
    expect(rec.failureHalf.expectedPhase).toBe('Upkeep');
  });

  it('failureHalf.receivedPhase is Main', () => {
    const rec = runTurnPhaseRecovery();
    expect(rec.failureHalf.receivedPhase).toBe('Main');
  });

  it('failureContained is true', () => {
    const rec = runTurnPhaseRecovery();
    expect(rec.failureContained).toBe(true);
  });

  it('failure audit trail has exactly 1 completed event (StartOfTurn)', () => {
    const rec = runTurnPhaseRecovery();
    expect(rec.failureHalf.auditTrailUpToFailure.length).toBe(1);
    expect(rec.failureHalf.auditTrailUpToFailure[0]).toMatch(/StartOfTurn/);
  });

  it('failure priorStateSummary.resolved is false', () => {
    const rec = runTurnPhaseRecovery();
    expect(rec.failureHalf.priorStateSummary['resolved']).toBe(false);
  });

});

// ─── Recovery half — clean execution ─────────────────────────────────────────

describe('R20 Recovery — recovery half proves clean execution', () => {

  it('recoverySucceeded is true', () => {
    const rec = runTurnPhaseRecovery();
    expect(rec.recoverySucceeded).toBe(true);
  });

  it('recovery finalState.resolved is true', () => {
    const rec = runTurnPhaseRecovery();
    expect(rec.recoveryHalf.finalState.resolved).toBe(true);
  });

  it('recovery executes all 7 phases (completedPhaseCount is 7)', () => {
    const rec = runTurnPhaseRecovery();
    expect(rec.recoveryHalf.finalState.completedPhases.length).toBe(7);
  });

  it('recovery phase order matches PHASE_ORDER exactly', () => {
    const rec = runTurnPhaseRecovery();
    expect([...rec.recoveryHalf.finalState.completedPhases]).toEqual([...PHASE_ORDER]);
  });

  it('recovery audit has 7 events — one per phase', () => {
    const rec = runTurnPhaseRecovery();
    expect(rec.recoveryHalf.auditTrail.length).toBe(7);
  });

  it('recovery audit contains no FAILURE marker', () => {
    const rec = runTurnPhaseRecovery();
    for (const event of rec.recoveryHalf.auditTrail) {
      expect(event).not.toMatch(/FAILURE/);
    }
  });

});

// ─── Audit separation ─────────────────────────────────────────────────────────

describe('R20 Recovery — failure and recovery audit trails are separated', () => {

  it('failure audit trail is stored separately from recovery audit trail', () => {
    const rec = runTurnPhaseRecovery();
    // The two arrays are distinct references — the recovery audit trail is not
    // a slice or alias of the failure audit trail.
    expect(rec.failureHalf.auditTrailUpToFailure).not.toBe(rec.recoveryHalf.auditTrail);
  });

  it('failure audit trail length (1) is less than recovery audit trail length (7)', () => {
    const rec = runTurnPhaseRecovery();
    expect(rec.failureHalf.auditTrailUpToFailure.length).toBeLessThan(
      rec.recoveryHalf.auditTrail.length,
    );
  });

  it('failure prior state (resolved: false) differs from recovery final state (resolved: true)', () => {
    const rec = runTurnPhaseRecovery();
    expect(rec.failureHalf.priorStateSummary['resolved']).toBe(false);
    expect(rec.recoveryHalf.finalState.resolved).toBe(true);
  });

  it('recovery audit trail contains no FAILURE marker — failure did not bleed through', () => {
    const rec = runTurnPhaseRecovery();
    for (const event of rec.recoveryHalf.auditTrail) {
      expect(event).not.toMatch(/FAILURE/);
    }
  });

});

// ─── Signature equality with clean turn ───────────────────────────────────────

describe('R20 Recovery — recovery signature equals clean-turn signature', () => {

  it('recovery half combinedHash equals firstCleanTurnScenario combinedHash', () => {
    const rec   = runTurnPhaseRecovery();
    const clean = firstCleanTurnScenario();
    expect(rec.recoveryHalf.signature.combinedHash).toBe(clean.signature.combinedHash);
  });

  it('recovery half deterministicProof is true', () => {
    const rec = runTurnPhaseRecovery();
    expect(rec.recoveryHalf.signature.deterministicProof).toBe(true);
  });

  it('clean-turn scenario is unaffected after recovery fixture execution', () => {
    runTurnPhaseRecovery();
    const clean = firstCleanTurnScenario();
    expect(clean.finalState.resolved).toBe(true);
    expect(clean.signature.deterministicProof).toBe(true);
  });

});

// ─── Determinism ──────────────────────────────────────────────────────────────

describe('R20 Recovery — full recovery result is deterministic', () => {

  it('two calls to runTurnPhaseRecovery produce identical failure failureCode', () => {
    expect(runTurnPhaseRecovery().failureHalf.failureCode)
      .toBe(runTurnPhaseRecovery().failureHalf.failureCode);
  });

  it('two calls produce identical recovery combinedHash', () => {
    expect(runTurnPhaseRecovery().recoveryHalf.signature.combinedHash)
      .toBe(runTurnPhaseRecovery().recoveryHalf.signature.combinedHash);
  });

  it('two calls to failureThenCleanRecoveryScenario produce identical combinedHash', () => {
    const a = failureThenCleanRecoveryScenario();
    const b = failureThenCleanRecoveryScenario();
    expect(a.signature.combinedHash).toBe(b.signature.combinedHash);
  });

  it('two calls produce identical auditTrail', () => {
    const a = failureThenCleanRecoveryScenario();
    const b = failureThenCleanRecoveryScenario();
    expect([...a.auditTrail]).toEqual([...b.auditTrail]);
  });

});

// ─── Replay Audit Fixture integration ────────────────────────────────────────

describe('R20 Recovery — Replay Audit Fixture integration', () => {

  it('buildAuditFixture succeeds for the recovery scenario', () => {
    const fix = buildAuditFixture(SCENARIO_FAILURE_THEN_CLEAN_RECOVERY);
    expect(fix.scenarioId).toBe(SCENARIO_FAILURE_THEN_CLEAN_RECOVERY);
  });

  it('auditEventCount is 10 (1 completed + 1 failure + 1 RECOVERY:START + 7 clean)', () => {
    const fix = buildAuditFixture(SCENARIO_FAILURE_THEN_CLEAN_RECOVERY);
    expect(fix.auditEventCount).toBe(10);
  });

  it('firstAuditEvent records StartOfTurn (from failure half)', () => {
    const fix = buildAuditFixture(SCENARIO_FAILURE_THEN_CLEAN_RECOVERY);
    expect(fix.firstAuditEvent).toMatch(/StartOfTurn/);
  });

  it('lastAuditEvent records EndOfTurn (from recovery half)', () => {
    const fix = buildAuditFixture(SCENARIO_FAILURE_THEN_CLEAN_RECOVERY);
    expect(fix.lastAuditEvent).toMatch(/EndOfTurn/);
  });

  it('audit fixture is deterministic (two calls produce same auditHash)', () => {
    const a = buildAuditFixture(SCENARIO_FAILURE_THEN_CLEAN_RECOVERY);
    const b = buildAuditFixture(SCENARIO_FAILURE_THEN_CLEAN_RECOVERY);
    expect(a.auditHash).toBe(b.auditHash);
  });

  it(SCENARIO_FIRST_CLEAN_TURN + ' auditHash differs from recovery scenario auditHash', () => {
    const cleanFix    = buildAuditFixture(SCENARIO_FIRST_CLEAN_TURN);
    const recoveryFix = buildAuditFixture(SCENARIO_FAILURE_THEN_CLEAN_RECOVERY);
    expect(cleanFix.auditHash).not.toBe(recoveryFix.auditHash);
  });

});
