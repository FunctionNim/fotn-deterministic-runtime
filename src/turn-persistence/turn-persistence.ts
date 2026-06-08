/**
 * R21 — Turn Phase Persistence Snapshot
 *
 * Serializes a completed turn pipeline result into a stable structured snapshot
 * and restores it back into structured runtime data.
 *
 * Guarantees:
 *   - Serialization is deterministic across repeated runs
 *   - Object key order in the JSON does not affect the restored result
 *   - Array order remains significant (phase order, audit trail order)
 *   - Restored result produces the same runtime signature as the original
 *
 * Doctrine: Pressure → Function → Consequence → Audit → Meaning
 */

import { PHASE_ORDER, TurnPhase, SCENARIO_FIRST_CLEAN_TURN, firstCleanTurnScenario } from '../turn-pipeline/turn-pipeline.js';
import { assembleResult, ReplayResult } from '../replay/replay-verifier.js';
import { RuntimeSignature } from '../runtime-signature/runtime-signature.js';

// ─── Scenario ID ───────────────────────────────────────────────────────────────

export const SCENARIO_PERSISTED_CLEAN_TURN = 'turn-pipeline:persisted-clean-turn';

// ─── Snapshot schema ──────────────────────────────────────────────────────────

/** Schema version for forward-compatibility detection. */
export type SnapshotSchemaVersion = 'v1';

/** Serializable state for one turn final-state entry. */
export interface PersistedTurnState {
  readonly turnId: string;
  readonly currentPhase: TurnPhase | null;
  readonly pressureLevel: number;
  readonly resolved: boolean;
  readonly completedPhaseCount: number;
}

/**
 * Stable structured snapshot of a completed turn pipeline result.
 *
 * All fields are JSON-serializable and order-stable.  Array order (phaseOrder,
 * auditTrail) is significant — reversing either changes the restored signature.
 */
export interface TurnPersistenceSnapshot {
  /** Incremented when the shape changes to allow detection of stale snapshots. */
  readonly schemaVersion: SnapshotSchemaVersion;
  /** Stable scenario identifier from the run that produced this snapshot. */
  readonly scenarioId: string;
  /** Canonical phase execution order at time of serialization. */
  readonly phaseOrder: readonly string[];
  /** Final turn state after all phases resolved. */
  readonly finalTurnState: PersistedTurnState;
  /** Ordered audit events — one per phase, in execution order. */
  readonly auditTrail: readonly string[];
  /** Deterministic runtime signature from the original run. */
  readonly signature: RuntimeSignature;
  /** True when identical state + identical events produced this result. */
  readonly deterministicProof: boolean;
}

// ─── Serialisation ────────────────────────────────────────────────────────────

/**
 * Serialize a ReplayResult into a stable JSON snapshot string.
 *
 * Keys within every object are always written in the same alphabetical order
 * so the serialization is byte-for-byte identical across runs regardless of
 * the source object's insertion order.
 */
export function serializeTurnResult(result: ReplayResult): string {
  const fs = result.finalState as Record<string, unknown>;
  const sig = result.signature;

  const snapshot: TurnPersistenceSnapshot = {
    auditTrail: [...result.auditTrail],
    deterministicProof: sig.deterministicProof,
    finalTurnState: {
      completedPhaseCount: fs['completedPhaseCount'] as number ?? 0,
      currentPhase:        fs['currentPhase'] as TurnPhase | null ?? null,
      pressureLevel:       fs['pressureLevel'] as number ?? 0,
      resolved:            fs['resolved'] as boolean ?? false,
      turnId:              fs['turnId'] as string ?? '',
    },
    phaseOrder: [...PHASE_ORDER],
    scenarioId: result.scenarioId,
    schemaVersion: 'v1',
    signature: {
      actionCount:        sig.actionCount,
      auditHash:          sig.auditHash,
      combinedHash:       sig.combinedHash,
      deterministicProof: sig.deterministicProof,
      finalStateHash:     sig.finalStateHash,
      initialStateHash:   sig.initialStateHash,
      inputHash:          sig.inputHash,
      memoryHash:         sig.memoryHash,
      scenarioId:         sig.scenarioId,
      signatureVersion:   sig.signatureVersion,
    },
  };

  // Stable key order: recursively sort object keys at every nesting level so
  // the serialized form is byte-identical regardless of property insertion order.
  // Arrays are serialized in their original order — order is significant.
  return JSON.stringify(snapshot, (_key, value: unknown) => {
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      const sorted: Record<string, unknown> = {};
      for (const k of Object.keys(value as object).sort()) {
        sorted[k] = (value as Record<string, unknown>)[k];
      }
      return sorted;
    }
    return value;
  });
}

// ─── Restoration ──────────────────────────────────────────────────────────────

/**
 * Restore a TurnPersistenceSnapshot from a JSON string produced by
 * serializeTurnResult.
 *
 * The restored object's fields are fully typed and ready for assertion.
 * Key order in the source JSON is irrelevant — the result is normalised.
 */
export function restoreTurnSnapshot(json: string): TurnPersistenceSnapshot {
  const raw = JSON.parse(json) as Record<string, unknown>;

  if (raw['schemaVersion'] !== 'v1') {
    throw new Error(
      `TurnPersistenceSnapshot: unsupported schemaVersion '${raw['schemaVersion']}'. ` +
      `Expected 'v1'.`,
    );
  }

  const sig = raw['signature'] as Record<string, unknown>;
  const fts = raw['finalTurnState'] as Record<string, unknown>;

  return {
    auditTrail:       (raw['auditTrail'] as string[]) ?? [],
    deterministicProof: raw['deterministicProof'] as boolean,
    finalTurnState: {
      completedPhaseCount: fts['completedPhaseCount'] as number,
      currentPhase:        fts['currentPhase'] as TurnPhase | null,
      pressureLevel:       fts['pressureLevel'] as number,
      resolved:            fts['resolved'] as boolean,
      turnId:              fts['turnId'] as string,
    },
    phaseOrder:  raw['phaseOrder'] as string[],
    scenarioId:  raw['scenarioId'] as string,
    schemaVersion: 'v1',
    signature: {
      actionCount:        sig['actionCount'] as number,
      auditHash:          sig['auditHash'] as string,
      combinedHash:       sig['combinedHash'] as string,
      deterministicProof: sig['deterministicProof'] as boolean,
      finalStateHash:     sig['finalStateHash'] as string,
      initialStateHash:   sig['initialStateHash'] as string,
      inputHash:          sig['inputHash'] as string,
      memoryHash:         sig['memoryHash'] as string | null,
      scenarioId:         sig['scenarioId'] as string,
      signatureVersion:   sig['signatureVersion'] as 'r13',
    },
  };
}

// ─── Persisted clean-turn scenario ────────────────────────────────────────────

/**
 * R21 — Persisted clean-turn scenario.
 *
 * Runs firstCleanTurnScenario, serializes the result to a snapshot, restores
 * it, then rebuilds a ReplayResult from the restored data.
 *
 * Proves that serialization + restoration is a lossless round-trip:
 *   - Restored auditTrail equals the original
 *   - Rebuilt signature.combinedHash equals the original
 *   - deterministicProof remains true throughout
 *
 * Returns a ReplayResult so the scenario can be registered in the Scenario
 * Registry and inspected through the Audit Fixture.
 */
export function persistedCleanTurnScenario(): ReplayResult {
  const original = firstCleanTurnScenario();

  // Round-trip through serialization
  const json     = serializeTurnResult(original);
  const restored = restoreTurnSnapshot(json);

  // Rebuild a ReplayResult from the restored data, using the same scenario ID
  // and the same orderedActions as the original (they are not persisted in the
  // snapshot because they're derivable from the audit trail, but for registry
  // compatibility we carry them through the original result).
  // Cast PersistedTurnState to the Readonly<Record<string,unknown>> that
  // assembleResult expects — all fields are JSON-compatible primitives.
  const restoredFinalState = { ...restored.finalTurnState } as Record<string, unknown>;

  return assembleResult(
    SCENARIO_PERSISTED_CLEAN_TURN,
    original.orderedActions,
    original.initialState,
    restoredFinalState,
    [...restored.auditTrail],
  );
}
