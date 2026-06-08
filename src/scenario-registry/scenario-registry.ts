/**
 * R14 — Scenario Registry
 *
 * A stable, central registry of named deterministic scenarios.
 *
 * Replay tests, demos, snapshots, and tools should reference scenarios by ID
 * through this registry rather than maintaining scattered imports.  The registry
 * is populated at module load and is thereafter frozen — no side effects,
 * no mutation after initialisation.
 *
 * Doctrine: Pressure → Function → Consequence → Audit → Meaning
 */

import type { ReplayResult } from '../replay/replay-verifier.js';

import {
  actIStoneRoomScenario,
  actIForcedFailureScenario,
  actIIFirstContinuationLoopScenario,
  SCENARIO_ACT_I_STONE_ROOM,
  SCENARIO_ACT_I_FORCED_FAILURE,
  SCENARIO_ACT_II_FIRST_LOOP,
} from '../replay/scenarios.js';

import {
  firstCleanTurnScenario,
  mutatedMainIntentScenario,
  SCENARIO_FIRST_CLEAN_TURN,
  SCENARIO_MUTATED_MAIN_INTENT,
} from '../turn-pipeline/turn-pipeline.js';

// ─── Types ────────────────────────────────────────────────────────────────────

/** How a scenario interacts with the memory layer. */
export type MemoryBehavior = 'none' | 'persisted';

/** Full metadata record for one registered scenario. */
export interface ScenarioMeta {
  /** Stable, globally unique scenario identifier. */
  readonly id: string;
  /** Human-readable display title. */
  readonly title: string;
  /**
   * Act or phase this scenario belongs to.
   * e.g. 'act-i', 'act-ii'
   */
  readonly phase: string;
  /**
   * The runtime domain this scenario exercises.
   * e.g. 'stone-room', 'first-continuation-loop'
   */
  readonly sourceDomain: string;
  /** Brief description of what the scenario proves. */
  readonly description: string;
  /** Expected number of ordered actions in the replay sequence. */
  readonly expectedActionCount: number;
  /** Whether the scenario persists memories (affects memoryHash in the signature). */
  readonly memoryBehavior: MemoryBehavior;
  /**
   * Factory function — call to produce a complete ReplayResult.
   * Must be deterministic: identical calls produce identical results.
   */
  readonly runner: () => ReplayResult;
}

// ─── Registry store ───────────────────────────────────────────────────────────

const _registry = new Map<string, ScenarioMeta>();

function register(meta: ScenarioMeta): void {
  if (_registry.has(meta.id)) {
    throw new Error(`Scenario registry: duplicate id '${meta.id}'`);
  }
  _registry.set(meta.id, Object.freeze(meta));
}

// ─── Registered scenarios ─────────────────────────────────────────────────────

register({
  id: SCENARIO_ACT_I_STONE_ROOM,
  title: 'Act I — Stone Room: That Would Not Fall',
  phase: 'act-i',
  sourceDomain: 'stone-room',
  description:
    'Full 17-action sequence through the Act I Stone Room: EnterRoom, then ' +
    'TestAnchor → NameProtection → NameReleaseCondition → CastAnchorPulse → ' +
    'ReleaseAnchor for each of three plates, then RecordLedger. ' +
    'Proves that the stone anchor pressure function resolves deterministically.',
  expectedActionCount: 17,
  memoryBehavior: 'none',
  runner: actIStoneRoomScenario,
});

register({
  id: SCENARIO_ACT_I_FORCED_FAILURE,
  title: 'Act I — Stone Room: Forced Failure (mutation probe)',
  phase: 'act-i',
  sourceDomain: 'stone-room',
  description:
    'Two-action sequence that forces a ForceBreak on plate:first instead of ' +
    'following the correct sequence. Used as a mutation probe: changing an ' +
    'action must change the final state and the deterministic signature.',
  expectedActionCount: 2,
  memoryBehavior: 'none',
  runner: actIForcedFailureScenario,
});

register({
  id: SCENARIO_ACT_II_FIRST_LOOP,
  title: 'Act II — First Continuation Loop',
  phase: 'act-ii',
  sourceDomain: 'first-continuation-loop',
  description:
    'Seven-step continuation loop: Intent:Observe → FunctionBox:ActivateSlot → ' +
    'Encounter:Escalate → Encounter:Stabilize+Resolve → Intent:Restore → ' +
    'Heartbeat:Tick → District:Update. Proves that the Act II loop resolves ' +
    'deterministically and that memories are persisted in stable order.',
  expectedActionCount: 7,
  memoryBehavior: 'persisted',
  runner: actIIFirstContinuationLoopScenario,
});

register({
  id: SCENARIO_FIRST_CLEAN_TURN,
  title: 'Turn Pipeline — First Clean Turn',
  phase: 'turn-pipeline',
  sourceDomain: 'turn-pipeline',
  description:
    'Seven-phase clean turn: StartOfTurn → Upkeep → Main → Journey → Alchemist → ' +
    'Combat → EndOfTurn. Each phase records one audit event. Ends with resolved: true ' +
    'and deterministicProof: true. Proves the turn pipeline advances phases in exact ' +
    'required order and produces a stable deterministic signature.',
  expectedActionCount: 7,
  memoryBehavior: 'none',
  runner: firstCleanTurnScenario,
});

register({
  id: SCENARIO_MUTATED_MAIN_INTENT,
  title: 'Turn Pipeline — Mutated Main Intent',
  phase: 'turn-pipeline',
  sourceDomain: 'turn-pipeline',
  description:
    'Intentional mutation of the first clean turn. pressureLevel starts at 5 ' +
    'and the Main phase label is changed to "pressure disruption in main". ' +
    'Proves that single-phase mutations propagate cleanly through all signature ' +
    'hash fields while leaving phase order and audit structure stable.',
  expectedActionCount: 7,
  memoryBehavior: 'none',
  runner: mutatedMainIntentScenario,
});

// Freeze the registry after population so no code can add or remove entries
// at runtime.
Object.freeze(_registry);

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Look up a scenario by ID.
 * Throws a descriptive error if the ID is not registered.
 */
export function lookupScenario(id: string): ScenarioMeta {
  const meta = _registry.get(id);
  if (meta === undefined) {
    const known = [..._registry.keys()].sort().join(', ');
    throw new Error(
      `Scenario registry: unknown id '${id}'. Known IDs: ${known}`,
    );
  }
  return meta;
}

/**
 * Safe lookup — returns ScenarioMeta or undefined without throwing.
 */
export function findScenario(id: string): ScenarioMeta | undefined {
  return _registry.get(id);
}

/**
 * Returns all registered scenario IDs in sorted order.
 * Deterministic: the order does not depend on insertion order.
 */
export function getAllScenarioIds(): readonly string[] {
  return [..._registry.keys()].sort();
}

/**
 * Returns all registered ScenarioMeta entries, sorted by ID.
 */
export function getAllScenarios(): readonly ScenarioMeta[] {
  return [..._registry.values()].sort((a, b) => a.id.localeCompare(b.id));
}

/**
 * Convenience: look up a scenario by ID and immediately run it.
 * Throws the same error as lookupScenario for unknown IDs.
 */
export function runScenario(id: string): ReplayResult {
  return lookupScenario(id).runner();
}
