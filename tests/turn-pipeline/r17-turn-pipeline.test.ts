/**
 * R17 — Turn Phase Pipeline tests.
 *
 * Proves:
 *   1. PHASE_ORDER has exactly 7 entries in the required order
 *   2. Phases execute in that exact required order
 *   3. Same input → same final state (determinism)
 *   4. Same input → same audit trail
 *   5. Same input → same runtime signature
 *   6. Changing a phase intent changes the audit trail and signature
 *   7. finalState.resolved is true after a full clean turn
 *   8. All seven phases appear in phaseTransitions
 *   9. Scenario registry lookup works for turn-pipeline:first-clean-turn
 *  10. Replay audit fixture can inspect the phase audit trail
 *  11. Audit fixture agrees with live signature hashes
 */

import { describe, it, expect } from 'vitest';
import {
  PHASE_ORDER,
  SCENARIO_FIRST_CLEAN_TURN,
  firstCleanTurnScenario,
  runTurnPipeline,
  TurnState,
  PhaseIntent,
} from '../../src/turn-pipeline/turn-pipeline.js';
import {
  lookupScenario,
  runScenario,
  getAllScenarioIds,
} from '../../src/scenario-registry/scenario-registry.js';
import {
  buildAuditFixture,
} from '../../src/replay-audit/replay-audit-fixture.js';

// ─── Phase order ───────────────────────────────────────────────────────────────

describe('R17 Turn Pipeline — phase order', () => {

  it('PHASE_ORDER contains exactly 7 phases', () => {
    expect(PHASE_ORDER.length).toBe(7);
  });

  it('PHASE_ORDER is exactly the required sequence', () => {
    expect([...PHASE_ORDER]).toEqual([
      'StartOfTurn',
      'Upkeep',
      'Main',
      'Journey',
      'Alchemist',
      'Combat',
      'EndOfTurn',
    ]);
  });

  it('phaseTransitions from a full clean run match PHASE_ORDER exactly', () => {
    const result = firstCleanTurnScenario();
    // audit trail encodes phase transitions as "phase:Phase — label"
    const phases = result.auditTrail.map((e) => e.split(' — ')[0].replace('phase:', ''));
    expect(phases).toEqual([...PHASE_ORDER]);
  });

  it('first audit event is StartOfTurn', () => {
    const result = firstCleanTurnScenario();
    expect(result.auditTrail[0]).toMatch(/^phase:StartOfTurn/);
  });

  it('last audit event is EndOfTurn', () => {
    const result = firstCleanTurnScenario();
    expect(result.auditTrail[result.auditTrail.length - 1]).toMatch(/^phase:EndOfTurn/);
  });

});

// ─── Determinism ───────────────────────────────────────────────────────────────

describe('R17 Turn Pipeline — determinism', () => {

  it('same input → same final state', () => {
    const a = firstCleanTurnScenario();
    const b = firstCleanTurnScenario();
    expect(a.finalState).toEqual(b.finalState);
  });

  it('same input → same audit trail', () => {
    const a = firstCleanTurnScenario();
    const b = firstCleanTurnScenario();
    expect([...a.auditTrail]).toEqual([...b.auditTrail]);
  });

  it('same input → same runtime signature combinedHash', () => {
    const a = firstCleanTurnScenario();
    const b = firstCleanTurnScenario();
    expect(a.signature.combinedHash).toBe(b.signature.combinedHash);
  });

  it('same input → same auditHash', () => {
    const a = firstCleanTurnScenario();
    const b = firstCleanTurnScenario();
    expect(a.signature.auditHash).toBe(b.signature.auditHash);
  });

  it('deterministicProof is true for the first clean turn', () => {
    const result = firstCleanTurnScenario();
    expect(result.signature.deterministicProof).toBe(true);
  });

});

// ─── State correctness ────────────────────────────────────────────────────────

describe('R17 Turn Pipeline — state correctness', () => {

  it('finalState.resolved is true after a full clean turn', () => {
    const result = firstCleanTurnScenario();
    expect(result.finalState.resolved).toBe(true);
  });

  it('auditTrail has exactly 7 entries (one per phase)', () => {
    const result = firstCleanTurnScenario();
    expect(result.auditTrail.length).toBe(7);
  });

  it('orderedActions has exactly 7 entries', () => {
    const result = firstCleanTurnScenario();
    expect(result.orderedActions.length).toBe(7);
  });

  it('scenarioId is correct', () => {
    const result = firstCleanTurnScenario();
    expect(result.scenarioId).toBe(SCENARIO_FIRST_CLEAN_TURN);
  });

  it('signature.scenarioId matches the scenario ID', () => {
    const result = firstCleanTurnScenario();
    expect(result.signature.scenarioId).toBe(SCENARIO_FIRST_CLEAN_TURN);
  });

});

// ─── Mutation sensitivity ─────────────────────────────────────────────────────

describe('R17 Turn Pipeline — changing input changes output', () => {

  const cleanInitial: TurnState = {
    turnId: 'turn-1',
    currentPhase: null,
    completedPhases: [],
    pressureLevel: 0,
    resolved: false,
  };

  const cleanIntents: PhaseIntent[] = [...PHASE_ORDER].map((phase) => ({
    phase,
    label: `begin ${phase.toLowerCase()}`,
  }));

  it('changing a phase label changes the audit trail', () => {
    const baseline = runTurnPipeline(SCENARIO_FIRST_CLEAN_TURN, cleanInitial, cleanIntents);
    const mutated: PhaseIntent[] = cleanIntents.map((i) =>
      i.phase === 'Combat' ? { ...i, label: 'escalated combat encounter' } : i,
    );
    const altered = runTurnPipeline(SCENARIO_FIRST_CLEAN_TURN, cleanInitial, mutated);
    expect([...altered.auditTrail]).not.toEqual([...baseline.auditTrail]);
  });

  it('changing a phase label changes the runtime signature', () => {
    const baseline = runTurnPipeline(SCENARIO_FIRST_CLEAN_TURN, cleanInitial, cleanIntents);
    const mutated: PhaseIntent[] = cleanIntents.map((i) =>
      i.phase === 'Main' ? { ...i, label: 'forced main disruption' } : i,
    );
    const altered = runTurnPipeline(SCENARIO_FIRST_CLEAN_TURN, cleanInitial, mutated);
    expect(altered.signature.combinedHash).not.toBe(baseline.signature.combinedHash);
  });

  it('changing turnId changes the signature', () => {
    const baseline = runTurnPipeline(SCENARIO_FIRST_CLEAN_TURN, cleanInitial, cleanIntents);
    const otherInitial: TurnState = { ...cleanInitial, turnId: 'turn-99' };
    const altered = runTurnPipeline(SCENARIO_FIRST_CLEAN_TURN, otherInitial, cleanIntents);
    expect(altered.signature.combinedHash).not.toBe(baseline.signature.combinedHash);
  });

});

// ─── Scenario Registry integration ────────────────────────────────────────────

describe('R17 Turn Pipeline — Scenario Registry integration', () => {

  it('turn-pipeline:first-clean-turn is registered in the registry', () => {
    expect(getAllScenarioIds()).toContain(SCENARIO_FIRST_CLEAN_TURN);
  });

  it('lookupScenario returns correct metadata', () => {
    const meta = lookupScenario(SCENARIO_FIRST_CLEAN_TURN);
    expect(meta.id).toBe(SCENARIO_FIRST_CLEAN_TURN);
    expect(meta.phase).toBe('turn-pipeline');
    expect(meta.expectedActionCount).toBe(7);
    expect(meta.memoryBehavior).toBe('none');
  });

  it('runScenario via registry produces the same combinedHash as the direct runner', () => {
    const fromRegistry = runScenario(SCENARIO_FIRST_CLEAN_TURN);
    const direct = firstCleanTurnScenario();
    expect(fromRegistry.signature.combinedHash).toBe(direct.signature.combinedHash);
  });

  it('registry now contains 8 scenarios total', () => {
    expect(getAllScenarioIds().length).toBe(8);
  });

});

// ─── Replay Audit Fixture integration ────────────────────────────────────────

describe('R17 Turn Pipeline — Replay Audit Fixture integration', () => {

  it('buildAuditFixture succeeds for turn-pipeline:first-clean-turn', () => {
    const fix = buildAuditFixture(SCENARIO_FIRST_CLEAN_TURN);
    expect(fix.scenarioId).toBe(SCENARIO_FIRST_CLEAN_TURN);
  });

  it('auditEventCount is 7 (one per phase)', () => {
    const fix = buildAuditFixture(SCENARIO_FIRST_CLEAN_TURN);
    expect(fix.auditEventCount).toBe(7);
  });

  it('firstAuditEvent starts with phase:StartOfTurn', () => {
    const fix = buildAuditFixture(SCENARIO_FIRST_CLEAN_TURN);
    expect(fix.firstAuditEvent).toMatch(/^phase:StartOfTurn/);
  });

  it('lastAuditEvent starts with phase:EndOfTurn', () => {
    const fix = buildAuditFixture(SCENARIO_FIRST_CLEAN_TURN);
    expect(fix.lastAuditEvent).toMatch(/^phase:EndOfTurn/);
  });

  it('auditHash from fixture matches live signature auditHash', () => {
    const fix = buildAuditFixture(SCENARIO_FIRST_CLEAN_TURN);
    const live = runScenario(SCENARIO_FIRST_CLEAN_TURN);
    expect(fix.auditHash).toBe(live.signature.auditHash);
  });

  it('deterministicProof is true in the audit fixture', () => {
    const fix = buildAuditFixture(SCENARIO_FIRST_CLEAN_TURN);
    expect(fix.deterministicProof).toBe(true);
  });

});
