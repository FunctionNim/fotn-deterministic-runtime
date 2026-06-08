/**
 * R18 — Turn Intent Mutation Fixture tests.
 *
 * Proves that changing one phase intent changes the runtime signature and
 * final state in a controlled, intentional way while:
 *   - preserving the required phase order
 *   - preserving deterministicProof true
 *   - localising the audit change to the mutated phase
 *
 * Mutation:
 *   Baseline — turn-pipeline:first-clean-turn
 *     pressureLevel: 0, every phase label "begin <phase>"
 *   Mutated  — turn-pipeline:mutated-main-intent
 *     pressureLevel: 5 (pre-existing pressure), Main label changed to
 *     "pressure disruption in main"
 *
 *   Changes expected:
 *     initialStateHash  — pressureLevel 0 → 5
 *     inputHash         — Main action label differs
 *     auditHash         — Main audit event label differs
 *     finalStateHash    — pressureLevel 5 in final state
 *     combinedHash      — all of the above
 *
 *   Stable:
 *     phase order (PHASE_ORDER, both scenarios)
 *     phaseTransitions length (7)
 *     auditEventCount (7)
 *     deterministicProof (true, both)
 *     6 of 7 audit events (all non-Main phases)
 */

import { describe, it, expect } from 'vitest';
import {
  PHASE_ORDER,
  SCENARIO_FIRST_CLEAN_TURN,
  SCENARIO_MUTATED_MAIN_INTENT,
  firstCleanTurnScenario,
  mutatedMainIntentScenario,
} from '../../src/turn-pipeline/turn-pipeline.js';
import {
  lookupScenario,
  runScenario,
  getAllScenarioIds,
} from '../../src/scenario-registry/scenario-registry.js';
import { buildAuditFixture } from '../../src/replay-audit/replay-audit-fixture.js';

// ─── Phase order preservation ─────────────────────────────────────────────────

describe('R18 Mutation Fixture — phase order is preserved', () => {

  it('baseline executes exactly PHASE_ORDER', () => {
    const result = firstCleanTurnScenario();
    const phases = result.auditTrail.map((e) => e.split(' — ')[0].replace('phase:', ''));
    expect(phases).toEqual([...PHASE_ORDER]);
  });

  it('mutated scenario executes exactly PHASE_ORDER', () => {
    const result = mutatedMainIntentScenario();
    const phases = result.auditTrail.map((e) => e.split(' — ')[0].replace('phase:', ''));
    expect(phases).toEqual([...PHASE_ORDER]);
  });

  it('both scenarios produce 7 audit events', () => {
    expect(firstCleanTurnScenario().auditTrail.length).toBe(7);
    expect(mutatedMainIntentScenario().auditTrail.length).toBe(7);
  });

  it('both scenarios have deterministicProof true', () => {
    expect(firstCleanTurnScenario().signature.deterministicProof).toBe(true);
    expect(mutatedMainIntentScenario().signature.deterministicProof).toBe(true);
  });

});

// ─── Determinism of the mutated scenario ──────────────────────────────────────

describe('R18 Mutation Fixture — mutated scenario is itself deterministic', () => {

  it('two calls to mutatedMainIntentScenario produce the same auditTrail', () => {
    const a = mutatedMainIntentScenario();
    const b = mutatedMainIntentScenario();
    expect([...a.auditTrail]).toEqual([...b.auditTrail]);
  });

  it('two calls produce the same combinedHash', () => {
    const a = mutatedMainIntentScenario();
    const b = mutatedMainIntentScenario();
    expect(a.signature.combinedHash).toBe(b.signature.combinedHash);
  });

  it('two calls produce the same finalState', () => {
    const a = mutatedMainIntentScenario();
    const b = mutatedMainIntentScenario();
    expect(a.finalState).toEqual(b.finalState);
  });

});

// ─── Signature divergence ─────────────────────────────────────────────────────

describe('R18 Mutation Fixture — signature fields diverge from baseline', () => {

  it('inputHash differs between baseline and mutated', () => {
    const base = firstCleanTurnScenario();
    const mut  = mutatedMainIntentScenario();
    expect(mut.signature.inputHash).not.toBe(base.signature.inputHash);
  });

  it('auditHash differs between baseline and mutated', () => {
    const base = firstCleanTurnScenario();
    const mut  = mutatedMainIntentScenario();
    expect(mut.signature.auditHash).not.toBe(base.signature.auditHash);
  });

  it('finalStateHash differs between baseline and mutated', () => {
    const base = firstCleanTurnScenario();
    const mut  = mutatedMainIntentScenario();
    expect(mut.signature.finalStateHash).not.toBe(base.signature.finalStateHash);
  });

  it('initialStateHash differs between baseline and mutated', () => {
    const base = firstCleanTurnScenario();
    const mut  = mutatedMainIntentScenario();
    expect(mut.signature.initialStateHash).not.toBe(base.signature.initialStateHash);
  });

  it('combinedHash differs between baseline and mutated', () => {
    const base = firstCleanTurnScenario();
    const mut  = mutatedMainIntentScenario();
    expect(mut.signature.combinedHash).not.toBe(base.signature.combinedHash);
  });

});

// ─── Mutation localisation ────────────────────────────────────────────────────

describe('R18 Mutation Fixture — mutation is localised to the Main phase', () => {

  it('exactly 6 of 7 audit events are identical between baseline and mutated', () => {
    const base = firstCleanTurnScenario();
    const mut  = mutatedMainIntentScenario();
    const same = base.auditTrail.filter((e, i) => e === mut.auditTrail[i]);
    expect(same.length).toBe(6);
  });

  it('the differing audit event is the Main phase event', () => {
    const base = firstCleanTurnScenario();
    const mut  = mutatedMainIntentScenario();
    const mainIdx = [...PHASE_ORDER].indexOf('Main');
    expect(base.auditTrail[mainIdx]).not.toBe(mut.auditTrail[mainIdx]);
    expect(base.auditTrail[mainIdx]).toMatch(/^phase:Main/);
    expect(mut.auditTrail[mainIdx]).toMatch(/^phase:Main/);
  });

  it('the mutated Main audit event contains the new label', () => {
    const mut = mutatedMainIntentScenario();
    const mainIdx = [...PHASE_ORDER].indexOf('Main');
    expect(mut.auditTrail[mainIdx]).toContain('pressure disruption in main');
  });

  it('the baseline Main audit event uses the original label', () => {
    const base = firstCleanTurnScenario();
    const mainIdx = [...PHASE_ORDER].indexOf('Main');
    expect(base.auditTrail[mainIdx]).toContain('begin main');
  });

  it('mutated finalState.pressureLevel differs from baseline (5 vs 0)', () => {
    const base = firstCleanTurnScenario();
    const mut  = mutatedMainIntentScenario();
    expect(mut.finalState.pressureLevel).toBe(5);
    expect(base.finalState.pressureLevel).toBe(0);
  });

});

// ─── Scenario Registry integration ────────────────────────────────────────────

describe('R18 Mutation Fixture — Scenario Registry integration', () => {

  it('turn-pipeline:mutated-main-intent is registered in the registry', () => {
    expect(getAllScenarioIds()).toContain(SCENARIO_MUTATED_MAIN_INTENT);
  });

  it('registry now contains 7 scenarios', () => {
    expect(getAllScenarioIds().length).toBe(7);
  });

  it('lookupScenario returns correct metadata for the mutated scenario', () => {
    const meta = lookupScenario(SCENARIO_MUTATED_MAIN_INTENT);
    expect(meta.id).toBe(SCENARIO_MUTATED_MAIN_INTENT);
    expect(meta.phase).toBe('turn-pipeline');
    expect(meta.expectedActionCount).toBe(7);
    expect(meta.memoryBehavior).toBe('none');
  });

  it('runScenario via registry produces the same combinedHash as the direct runner', () => {
    const fromRegistry = runScenario(SCENARIO_MUTATED_MAIN_INTENT);
    const direct = mutatedMainIntentScenario();
    expect(fromRegistry.signature.combinedHash).toBe(direct.signature.combinedHash);
  });

  it('baseline and mutated registry runners produce different combinedHashes', () => {
    const base = runScenario(SCENARIO_FIRST_CLEAN_TURN);
    const mut  = runScenario(SCENARIO_MUTATED_MAIN_INTENT);
    expect(mut.signature.combinedHash).not.toBe(base.signature.combinedHash);
  });

});

// ─── Replay Audit Fixture integration ────────────────────────────────────────

describe('R18 Mutation Fixture — Replay Audit Fixture integration', () => {

  it('buildAuditFixture succeeds for the mutated scenario', () => {
    const fix = buildAuditFixture(SCENARIO_MUTATED_MAIN_INTENT);
    expect(fix.scenarioId).toBe(SCENARIO_MUTATED_MAIN_INTENT);
  });

  it('mutated fixture auditEventCount is 7', () => {
    const fix = buildAuditFixture(SCENARIO_MUTATED_MAIN_INTENT);
    expect(fix.auditEventCount).toBe(7);
  });

  it('mutated fixture auditHash differs from baseline fixture auditHash', () => {
    const base = buildAuditFixture(SCENARIO_FIRST_CLEAN_TURN);
    const mut  = buildAuditFixture(SCENARIO_MUTATED_MAIN_INTENT);
    expect(mut.auditHash).not.toBe(base.auditHash);
  });

  it('mutated fixture is deterministic (two calls produce same auditHash)', () => {
    const a = buildAuditFixture(SCENARIO_MUTATED_MAIN_INTENT);
    const b = buildAuditFixture(SCENARIO_MUTATED_MAIN_INTENT);
    expect(a.auditHash).toBe(b.auditHash);
  });

  it('mutated fixture deterministicProof is true', () => {
    const fix = buildAuditFixture(SCENARIO_MUTATED_MAIN_INTENT);
    expect(fix.deterministicProof).toBe(true);
  });

});
