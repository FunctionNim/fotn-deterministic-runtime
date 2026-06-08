/**
 * R17 — Turn Phase Pipeline Domain
 *
 * A small, deterministic turn phase pipeline that models ordered turn phases
 * in the FOTN runtime.  The pipeline accepts an initial turn state and a
 * sequence of phase intents, advances through a fixed phase order, and
 * produces an auditable, signature-verified result.
 *
 * Phase order (canonical, immutable):
 *   StartOfTurn → Upkeep → Main → Journey → Alchemist → Combat → EndOfTurn
 *
 * Doctrine: Pressure → Function → Consequence → Audit → Meaning
 */

import {
  buildRuntimeSignature,
  RuntimeSignature,
} from '../runtime-signature/runtime-signature.js';

import type { ReplayAction, ReplayFinalState, ReplayResult } from '../replay/replay-verifier.js';
import { assembleResult } from '../replay/replay-verifier.js';

// ─── Phase order ───────────────────────────────────────────────────────────────

export const PHASE_ORDER = [
  'StartOfTurn',
  'Upkeep',
  'Main',
  'Journey',
  'Alchemist',
  'Combat',
  'EndOfTurn',
] as const;

export type TurnPhase = typeof PHASE_ORDER[number];

// ─── Scenario ID ──────────────────────────────────────────────────────────────

export const SCENARIO_FIRST_CLEAN_TURN = 'turn-pipeline:first-clean-turn';

// ─── Types ────────────────────────────────────────────────────────────────────

/** Structured state for one game turn. */
export interface TurnState {
  /** Stable identifier for this turn. */
  readonly turnId: string;
  /** The phase that is currently active, or null before the turn begins. */
  readonly currentPhase: TurnPhase | null;
  /** Phases that have already completed, in execution order. */
  readonly completedPhases: readonly TurnPhase[];
  /** Accumulated pressure across all phases this turn. */
  readonly pressureLevel: number;
  /** True once EndOfTurn has resolved. */
  readonly resolved: boolean;
}

/** One intent submitted for a single phase. */
export interface PhaseIntent {
  /** Which phase this intent belongs to. */
  readonly phase: TurnPhase;
  /** Human-readable label describing what happens in this phase. */
  readonly label: string;
}

/** Full result of running a turn through the pipeline. */
export interface TurnPipelineResult {
  /** Stable scenario identifier. */
  readonly scenarioId: string;
  /** Structured snapshot of state before any phase ran. */
  readonly initialState: TurnState;
  /** Structured snapshot of state after all phases completed. */
  readonly finalState: TurnState;
  /** Phases in the order they executed (mirrors PHASE_ORDER for a full turn). */
  readonly phaseTransitions: readonly TurnPhase[];
  /** One audit entry per phase, in execution order. */
  readonly auditTrail: readonly string[];
  /** Ordered action list used for signature construction. */
  readonly orderedActions: readonly ReplayAction[];
  /** Canonical deterministic signature for this pipeline run. */
  readonly signature: RuntimeSignature;
}

// ─── Pipeline engine ──────────────────────────────────────────────────────────

/**
 * Run a full turn through the pipeline.
 *
 * @param scenarioId  Stable identifier placed in the signature.
 * @param initialState  State before any phase runs.
 * @param phaseIntents  One intent per phase, in PHASE_ORDER order.
 *   Extra intents are silently ignored; missing phases use the phase name as label.
 *
 * Deterministic: identical inputs always produce identical outputs.
 */
export function runTurnPipeline(
  scenarioId: string,
  initialState: TurnState,
  phaseIntents: readonly PhaseIntent[],
): TurnPipelineResult {
  // Build a fast lookup from phase → label
  const intentMap = new Map<TurnPhase, string>();
  for (const intent of phaseIntents) {
    intentMap.set(intent.phase, intent.label);
  }

  const phaseTransitions: TurnPhase[] = [];
  const auditTrail: string[] = [];
  const orderedActions: ReplayAction[] = [];

  let state: TurnState = { ...initialState };

  for (let i = 0; i < PHASE_ORDER.length; i++) {
    const phase = PHASE_ORDER[i];
    const label = intentMap.get(phase) ?? phase;

    // Advance state
    state = {
      ...state,
      currentPhase: phase,
      completedPhases: [...state.completedPhases, phase],
      resolved: phase === 'EndOfTurn',
    };

    phaseTransitions.push(phase);
    auditTrail.push(`phase:${phase} — ${label}`);
    orderedActions.push({ label: `${phase}:${label}`, index: i });
  }

  // Treat the initial state as a serialisable object for signature purposes
  const initialStateSerialisable: ReplayFinalState = {
    turnId: initialState.turnId,
    currentPhase: initialState.currentPhase,
    pressureLevel: initialState.pressureLevel,
    resolved: initialState.resolved,
    completedPhaseCount: initialState.completedPhases.length,
  };

  const finalStateSerialisable: ReplayFinalState = {
    turnId: state.turnId,
    currentPhase: state.currentPhase,
    pressureLevel: state.pressureLevel,
    resolved: state.resolved,
    completedPhaseCount: state.completedPhases.length,
  };

  const signature = buildRuntimeSignature({
    scenarioId,
    initialState: initialStateSerialisable,
    orderedActions,
    finalState: finalStateSerialisable,
    auditTrail,
    deterministicProof: true,
  });

  return {
    scenarioId,
    initialState,
    finalState: state,
    phaseTransitions,
    auditTrail,
    orderedActions,
    signature,
  };
}

// ─── First Clean Turn Scenario ─────────────────────────────────────────────────

/**
 * The canonical first clean turn:
 *   - Starts at StartOfTurn (currentPhase: null, pressureLevel 0)
 *   - Advances through all seven phases
 *   - Records one audit event per phase
 *   - Ends at EndOfTurn with resolved: true and deterministicProof: true
 *
 * Returns a ReplayResult so the scenario can be registered in the R14
 * Scenario Registry and inspected through the R15 Audit Fixture.
 */
export function firstCleanTurnScenario(): ReplayResult {
  const initialState: TurnState = {
    turnId: 'turn-1',
    currentPhase: null,
    completedPhases: [],
    pressureLevel: 0,
    resolved: false,
  };

  const phaseIntents: PhaseIntent[] = PHASE_ORDER.map((phase) => ({
    phase,
    label: `begin ${phase.toLowerCase()}`,
  }));

  const pipelineResult = runTurnPipeline(
    SCENARIO_FIRST_CLEAN_TURN,
    initialState,
    phaseIntents,
  );

  // Serialisable state snapshots for ReplayResult / assembleResult
  const replayInitialState: ReplayFinalState = {
    turnId: initialState.turnId,
    currentPhase: initialState.currentPhase,
    pressureLevel: initialState.pressureLevel,
    resolved: initialState.resolved,
    completedPhaseCount: initialState.completedPhases.length,
  };

  const fs = pipelineResult.finalState;
  const replayFinalState: ReplayFinalState = {
    turnId: fs.turnId,
    currentPhase: fs.currentPhase,
    pressureLevel: fs.pressureLevel,
    resolved: fs.resolved,
    completedPhaseCount: fs.completedPhases.length,
  };

  return assembleResult(
    SCENARIO_FIRST_CLEAN_TURN,
    pipelineResult.orderedActions,
    replayInitialState,
    replayFinalState,
    [...pipelineResult.auditTrail],
  );
}
