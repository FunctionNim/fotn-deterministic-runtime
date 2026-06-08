/**
 * R14 — Scenario Registry tests.
 *
 * Proves:
 *   1. All expected scenario IDs are registered
 *   2. Scenario IDs are unique in the registry
 *   3. Lookup by ID works (both throwing and safe variants)
 *   4. Unknown ID returns a safe result or throws a clear error
 *   5. Registered scenario metadata matches expected values
 *   6. Replay still works through registry lookup
 *   7. signature.scenarioId matches the registry scenario id
 */

import { describe, it, expect } from 'vitest';
import {
  lookupScenario,
  findScenario,
  getAllScenarioIds,
  getAllScenarios,
  runScenario,
} from '../../src/scenario-registry/scenario-registry.js';
import {
  actIStoneRoomScenario,
  actIIFirstContinuationLoopScenario,
  actIForcedFailureScenario,
  SCENARIO_ACT_I_STONE_ROOM,
  SCENARIO_ACT_I_FORCED_FAILURE,
  SCENARIO_ACT_II_FIRST_LOOP,
} from '../../src/replay/scenarios.js';

const EXPECTED_IDS = [
  SCENARIO_ACT_I_STONE_ROOM,
  SCENARIO_ACT_I_FORCED_FAILURE,
  SCENARIO_ACT_II_FIRST_LOOP,
];

// ─── Registration ─────────────────────────────────────────────────────────────

describe('R14 Scenario Registry — registration', () => {

  it('all expected scenario IDs are present in the registry', () => {
    const ids = getAllScenarioIds();
    for (const id of EXPECTED_IDS) {
      expect(ids).toContain(id);
    }
  });

  it('all scenario IDs are unique — no duplicates', () => {
    const ids = getAllScenarioIds();
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it('getAllScenarios() returns exactly 5 entries', () => {
    expect(getAllScenarios().length).toBe(5);
  });

  it('every registered scenario has all required metadata fields', () => {
    for (const meta of getAllScenarios()) {
      expect(typeof meta.id).toBe('string');
      expect(meta.id.length).toBeGreaterThan(0);
      expect(typeof meta.title).toBe('string');
      expect(meta.title.length).toBeGreaterThan(0);
      expect(typeof meta.phase).toBe('string');
      expect(typeof meta.sourceDomain).toBe('string');
      expect(typeof meta.description).toBe('string');
      expect(typeof meta.expectedActionCount).toBe('number');
      expect(meta.expectedActionCount).toBeGreaterThan(0);
      expect(['none', 'persisted']).toContain(meta.memoryBehavior);
      expect(typeof meta.runner).toBe('function');
    }
  });

  it('scenario id in metadata matches the registry key (no drift)', () => {
    for (const id of getAllScenarioIds()) {
      const meta = lookupScenario(id);
      expect(meta.id).toBe(id);
    }
  });

});

// ─── Lookup ───────────────────────────────────────────────────────────────────

describe('R14 Scenario Registry — lookup', () => {

  it('lookupScenario() returns the correct metadata for a known ID', () => {
    const meta = lookupScenario(SCENARIO_ACT_I_STONE_ROOM);
    expect(meta.id).toBe(SCENARIO_ACT_I_STONE_ROOM);
    expect(meta.phase).toBe('act-i');
    expect(meta.sourceDomain).toBe('stone-room');
  });

  it('lookupScenario() throws a clear error for an unknown ID', () => {
    expect(() => lookupScenario('does-not-exist')).toThrowError(
      /unknown id 'does-not-exist'/,
    );
  });

  it('findScenario() returns ScenarioMeta for known IDs without throwing', () => {
    for (const id of EXPECTED_IDS) {
      const meta = findScenario(id);
      expect(meta).toBeDefined();
      expect(meta!.id).toBe(id);
    }
  });

  it('findScenario() returns undefined for unknown IDs — no throw', () => {
    const result = findScenario('does-not-exist');
    expect(result).toBeUndefined();
  });

});

// ─── Metadata validation ──────────────────────────────────────────────────────

describe('R14 Scenario Registry — metadata validation', () => {

  it('Act I Stone Room: expectedActionCount 17, memoryBehavior none', () => {
    const meta = lookupScenario(SCENARIO_ACT_I_STONE_ROOM);
    expect(meta.expectedActionCount).toBe(17);
    expect(meta.memoryBehavior).toBe('none');
  });

  it('Act II First Continuation Loop: expectedActionCount 7, memoryBehavior persisted', () => {
    const meta = lookupScenario(SCENARIO_ACT_II_FIRST_LOOP);
    expect(meta.expectedActionCount).toBe(7);
    expect(meta.memoryBehavior).toBe('persisted');
  });

  it('Act I Forced Failure: expectedActionCount 2, memoryBehavior none', () => {
    const meta = lookupScenario(SCENARIO_ACT_I_FORCED_FAILURE);
    expect(meta.expectedActionCount).toBe(2);
    expect(meta.memoryBehavior).toBe('none');
  });

  it('phase tags are correct — act-i for stone room scenarios, act-ii for loop', () => {
    expect(lookupScenario(SCENARIO_ACT_I_STONE_ROOM).phase).toBe('act-i');
    expect(lookupScenario(SCENARIO_ACT_I_FORCED_FAILURE).phase).toBe('act-i');
    expect(lookupScenario(SCENARIO_ACT_II_FIRST_LOOP).phase).toBe('act-ii');
  });

});

// ─── Replay via registry ──────────────────────────────────────────────────────

describe('R14 Scenario Registry — replay via registry', () => {

  it('runScenario() returns a ReplayResult with the correct scenarioId', () => {
    for (const id of EXPECTED_IDS) {
      const result = runScenario(id);
      expect(result.scenarioId).toBe(id);
      expect(result.signature.scenarioId).toBe(id);
    }
  });

  it('signature.scenarioId matches the registry scenario id for every entry', () => {
    for (const meta of getAllScenarios()) {
      const result = meta.runner();
      expect(result.signature.scenarioId).toBe(meta.id);
    }
  });

  it('two calls to runScenario() with the same id produce the same combinedHash', () => {
    for (const id of EXPECTED_IDS) {
      const a = runScenario(id);
      const b = runScenario(id);
      expect(a.signature.combinedHash).toBe(b.signature.combinedHash);
    }
  });

  it('registry runner produces the same result as the direct scenario import', () => {
    const fromRegistry = runScenario(SCENARIO_ACT_I_STONE_ROOM);
    const direct = actIStoneRoomScenario();
    expect(fromRegistry.signature.combinedHash).toBe(direct.signature.combinedHash);
    expect(fromRegistry.finalState).toEqual(direct.finalState);

    const fromRegistry2 = runScenario(SCENARIO_ACT_II_FIRST_LOOP);
    const direct2 = actIIFirstContinuationLoopScenario();
    expect(fromRegistry2.signature.combinedHash).toBe(direct2.signature.combinedHash);

    const fromRegistry3 = runScenario(SCENARIO_ACT_I_FORCED_FAILURE);
    const direct3 = actIForcedFailureScenario();
    expect(fromRegistry3.signature.combinedHash).toBe(direct3.signature.combinedHash);
  });

});
