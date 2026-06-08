/**
 * R19 — Turn Phase Failure Guard tests.
 *
 * Proves that invalid or out-of-order phase intents are rejected clearly and
 * deterministically without corrupting state, audit trail, or signatures.
 *
 * Invalid transition tested:
 *   StartOfTurn → Main  (skipping required Upkeep)
 *   Expected: Upkeep, Received: Main
 *   Failure code: OUT_OF_ORDER_PHASE
 *
 * Guarantees proved:
 *   - Structured FailureGuardResult returned (no unhandled throw)
 *   - Failure code, expected/received phase are correct and stable
 *   - Audit trail up to failure is stable (1 completed event: StartOfTurn)
 *   - Prior state is preserved (only StartOfTurn completed)
 *   - Failure signature is deterministic across repeated calls
 *   - Clean-turn scenario is unaffected by the invalid scenario
 *   - Scenario registry and Audit Fixture integration work
 */

import { describe, it, expect } from 'vitest';
import {
  SCENARIO_FIRST_CLEAN_TURN,
  SCENARIO_INVALID_PHASE_ORDER,
  firstCleanTurnScenario,
  invalidPhaseOrderScenario,
  runTurnPipelineGuarded,
  isFailureGuardResult,
  TurnState,
  PhaseIntent,
} from '../../src/turn-pipeline/turn-pipeline.js';
import {
  lookupScenario,
  runScenario,
  getAllScenarioIds,
} from '../../src/scenario-registry/scenario-registry.js';
import { buildAuditFixture } from '../../src/replay-audit/replay-audit-fixture.js';

// ─── Invalid phase order is rejected ─────────────────────────────────────────

describe('R19 Failure Guard — invalid phase order is rejected', () => {

  const initial: TurnState = {
    turnId: 'turn-fail',
    currentPhase: null,
    completedPhases: [],
    pressureLevel: 0,
    resolved: false,
  };

  // StartOfTurn → Main (skips Upkeep)
  const invalidIntents: PhaseIntent[] = [
    { phase: 'StartOfTurn', label: 'begin startofturn' },
    { phase: 'Main',        label: 'begin main' },
    { phase: 'Upkeep',     label: 'begin upkeep' },
    { phase: 'Journey',    label: 'begin journey' },
    { phase: 'Alchemist',  label: 'begin alchemist' },
    { phase: 'Combat',     label: 'begin combat' },
    { phase: 'EndOfTurn',  label: 'begin endofturn' },
  ];

  it('runTurnPipelineGuarded returns a FailureGuardResult (does not throw)', () => {
    const result = runTurnPipelineGuarded(SCENARIO_INVALID_PHASE_ORDER, initial, invalidIntents);
    expect(isFailureGuardResult(result)).toBe(true);
  });

  it('failureCode is OUT_OF_ORDER_PHASE', () => {
    const result = runTurnPipelineGuarded(SCENARIO_INVALID_PHASE_ORDER, initial, invalidIntents);
    if (!isFailureGuardResult(result)) throw new Error('Expected FailureGuardResult');
    expect(result.failureCode).toBe('OUT_OF_ORDER_PHASE');
  });

  it('expectedPhase is Upkeep', () => {
    const result = runTurnPipelineGuarded(SCENARIO_INVALID_PHASE_ORDER, initial, invalidIntents);
    if (!isFailureGuardResult(result)) throw new Error('Expected FailureGuardResult');
    expect(result.expectedPhase).toBe('Upkeep');
  });

  it('receivedPhase is Main', () => {
    const result = runTurnPipelineGuarded(SCENARIO_INVALID_PHASE_ORDER, initial, invalidIntents);
    if (!isFailureGuardResult(result)) throw new Error('Expected FailureGuardResult');
    expect(result.receivedPhase).toBe('Main');
  });

  it('failureReason is a non-empty descriptive string', () => {
    const result = runTurnPipelineGuarded(SCENARIO_INVALID_PHASE_ORDER, initial, invalidIntents);
    if (!isFailureGuardResult(result)) throw new Error('Expected FailureGuardResult');
    expect(result.failureReason.length).toBeGreaterThan(0);
    expect(result.failureReason).toMatch(/Upkeep/);
    expect(result.failureReason).toMatch(/Main/);
  });

  it('valid phase order returns TurnPipelineResult (not FailureGuardResult)', () => {
    const validIntents: PhaseIntent[] = [
      { phase: 'StartOfTurn', label: 'begin startofturn' },
      { phase: 'Upkeep',     label: 'begin upkeep' },
      { phase: 'Main',       label: 'begin main' },
      { phase: 'Journey',    label: 'begin journey' },
      { phase: 'Alchemist',  label: 'begin alchemist' },
      { phase: 'Combat',     label: 'begin combat' },
      { phase: 'EndOfTurn',  label: 'begin endofturn' },
    ];
    const result = runTurnPipelineGuarded(SCENARIO_FIRST_CLEAN_TURN, initial, validIntents);
    expect(isFailureGuardResult(result)).toBe(false);
  });

});

// ─── Prior state and audit are preserved ──────────────────────────────────────

describe('R19 Failure Guard — prior state and audit trail are preserved at failure', () => {

  const initial: TurnState = {
    turnId: 'turn-fail',
    currentPhase: null,
    completedPhases: [],
    pressureLevel: 0,
    resolved: false,
  };

  const invalidIntents: PhaseIntent[] = [
    { phase: 'StartOfTurn', label: 'begin startofturn' },
    { phase: 'Main',        label: 'begin main' },
    { phase: 'Upkeep',     label: 'begin upkeep' },
    { phase: 'Journey',    label: 'begin journey' },
    { phase: 'Alchemist',  label: 'begin alchemist' },
    { phase: 'Combat',     label: 'begin combat' },
    { phase: 'EndOfTurn',  label: 'begin endofturn' },
  ];

  it('auditTrailUpToFailure contains exactly 1 entry (StartOfTurn completed)', () => {
    const result = runTurnPipelineGuarded(SCENARIO_INVALID_PHASE_ORDER, initial, invalidIntents);
    if (!isFailureGuardResult(result)) throw new Error('Expected FailureGuardResult');
    expect(result.auditTrailUpToFailure.length).toBe(1);
  });

  it('auditTrailUpToFailure[0] records the StartOfTurn phase', () => {
    const result = runTurnPipelineGuarded(SCENARIO_INVALID_PHASE_ORDER, initial, invalidIntents);
    if (!isFailureGuardResult(result)) throw new Error('Expected FailureGuardResult');
    expect(result.auditTrailUpToFailure[0]).toMatch(/StartOfTurn/);
  });

  it('priorStateSummary.completedPhaseCount is 1 (only StartOfTurn)', () => {
    const result = runTurnPipelineGuarded(SCENARIO_INVALID_PHASE_ORDER, initial, invalidIntents);
    if (!isFailureGuardResult(result)) throw new Error('Expected FailureGuardResult');
    expect(result.priorStateSummary['completedPhaseCount']).toBe(1);
  });

  it('priorStateSummary.resolved is false (turn did not complete)', () => {
    const result = runTurnPipelineGuarded(SCENARIO_INVALID_PHASE_ORDER, initial, invalidIntents);
    if (!isFailureGuardResult(result)) throw new Error('Expected FailureGuardResult');
    expect(result.priorStateSummary['resolved']).toBe(false);
  });

});

// ─── Determinism ───────────────────────────────────────────────────────────────

describe('R19 Failure Guard — failure result is deterministic', () => {

  it('two calls to invalidPhaseOrderScenario produce identical auditTrail', () => {
    const a = invalidPhaseOrderScenario();
    const b = invalidPhaseOrderScenario();
    expect([...a.auditTrail]).toEqual([...b.auditTrail]);
  });

  it('two calls produce the same signature combinedHash', () => {
    const a = invalidPhaseOrderScenario();
    const b = invalidPhaseOrderScenario();
    expect(a.signature.combinedHash).toBe(b.signature.combinedHash);
  });

  it('two calls produce the same finalState', () => {
    const a = invalidPhaseOrderScenario();
    const b = invalidPhaseOrderScenario();
    expect(a.finalState).toEqual(b.finalState);
  });

  it('failure scenario does not affect clean-turn scenario', () => {
    invalidPhaseOrderScenario();
    const clean = firstCleanTurnScenario();
    expect(clean.finalState.resolved).toBe(true);
    expect(clean.signature.deterministicProof).toBe(true);
  });

  it('failure combinedHash differs from clean-turn combinedHash', () => {
    const fail  = invalidPhaseOrderScenario();
    const clean = firstCleanTurnScenario();
    expect(fail.signature.combinedHash).not.toBe(clean.signature.combinedHash);
  });

});

// ─── Scenario Registry integration ────────────────────────────────────────────

describe('R19 Failure Guard — Scenario Registry integration', () => {

  it('turn-pipeline:invalid-phase-order is registered in the registry', () => {
    expect(getAllScenarioIds()).toContain(SCENARIO_INVALID_PHASE_ORDER);
  });

  it('registry now contains 8 scenarios', () => {
    expect(getAllScenarioIds().length).toBe(8);
  });

  it('lookupScenario returns correct metadata for the failure scenario', () => {
    const meta = lookupScenario(SCENARIO_INVALID_PHASE_ORDER);
    expect(meta.id).toBe(SCENARIO_INVALID_PHASE_ORDER);
    expect(meta.phase).toBe('turn-pipeline');
    expect(meta.memoryBehavior).toBe('none');
  });

  it('runScenario via registry matches the direct runner combinedHash', () => {
    const fromRegistry = runScenario(SCENARIO_INVALID_PHASE_ORDER);
    const direct       = invalidPhaseOrderScenario();
    expect(fromRegistry.signature.combinedHash).toBe(direct.signature.combinedHash);
  });

});

// ─── Replay Audit Fixture integration ────────────────────────────────────────

describe('R19 Failure Guard — Replay Audit Fixture integration', () => {

  it('buildAuditFixture succeeds for the failure scenario', () => {
    const fix = buildAuditFixture(SCENARIO_INVALID_PHASE_ORDER);
    expect(fix.scenarioId).toBe(SCENARIO_INVALID_PHASE_ORDER);
  });

  it('auditEventCount is 2 (1 completed phase + 1 failure event)', () => {
    const fix = buildAuditFixture(SCENARIO_INVALID_PHASE_ORDER);
    expect(fix.auditEventCount).toBe(2);
  });

  it('firstAuditEvent records the StartOfTurn phase', () => {
    const fix = buildAuditFixture(SCENARIO_INVALID_PHASE_ORDER);
    expect(fix.firstAuditEvent).toMatch(/StartOfTurn/);
  });

  it('lastAuditEvent records the failure', () => {
    const fix = buildAuditFixture(SCENARIO_INVALID_PHASE_ORDER);
    expect(fix.lastAuditEvent).toMatch(/FAILURE/);
  });

  it('audit fixture is deterministic (two calls produce same auditHash)', () => {
    const a = buildAuditFixture(SCENARIO_INVALID_PHASE_ORDER);
    const b = buildAuditFixture(SCENARIO_INVALID_PHASE_ORDER);
    expect(a.auditHash).toBe(b.auditHash);
  });

});
