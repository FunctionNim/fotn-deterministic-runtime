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
export const SCENARIO_MUTATED_MAIN_INTENT = 'turn-pipeline:mutated-main-intent';

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

// ─── Scenario helpers ──────────────────────────────────────────────────────────

/**
 * Shared helper — converts a TurnPipelineResult into a ReplayResult using the
 * same serialisable state shape for both scenarios so the two are directly
 * comparable by their hash fields.
 */
function pipelineResultToReplay(pipelineResult: TurnPipelineResult): ReplayResult {
  const init = pipelineResult.initialState;
  const fs   = pipelineResult.finalState;

  const replayInitialState: ReplayFinalState = {
    turnId: init.turnId,
    currentPhase: init.currentPhase,
    pressureLevel: init.pressureLevel,
    resolved: init.resolved,
    completedPhaseCount: init.completedPhases.length,
  };

  const replayFinalState: ReplayFinalState = {
    turnId: fs.turnId,
    currentPhase: fs.currentPhase,
    pressureLevel: fs.pressureLevel,
    resolved: fs.resolved,
    completedPhaseCount: fs.completedPhases.length,
  };

  return assembleResult(
    pipelineResult.scenarioId,
    pipelineResult.orderedActions,
    replayInitialState,
    replayFinalState,
    [...pipelineResult.auditTrail],
  );
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

  return pipelineResultToReplay(
    runTurnPipeline(SCENARIO_FIRST_CLEAN_TURN, initialState, phaseIntents),
  );
}

// ─── Mutated Main Intent Scenario ──────────────────────────────────────────────

/**
 * R18 — Intentional mutation of the first clean turn.
 *
 * Changes from baseline (turn-pipeline:first-clean-turn):
 *   - pressureLevel starts at 5 (instead of 0)  → initialStateHash differs,
 *     finalStateHash differs
 *   - Main phase label changed to "pressure disruption in main"
 *     (instead of "begin main")  → inputHash differs, auditHash differs
 *
 * Preserved from baseline:
 *   - Exact PHASE_ORDER execution
 *   - One audit event per phase (7 total)
 *   - deterministicProof: true
 *   - Six of seven audit events are identical
 *
 * Used to prove that single-phase intent mutations propagate cleanly and
 * completely through the signature system while leaving unrelated fields stable.
 */
export function mutatedMainIntentScenario(): ReplayResult {
  const initialState: TurnState = {
    turnId: 'turn-1',
    currentPhase: null,
    completedPhases: [],
    pressureLevel: 5,
    resolved: false,
  };

  const phaseIntents: PhaseIntent[] = PHASE_ORDER.map((phase) => ({
    phase,
    label: phase === 'Main'
      ? 'pressure disruption in main'
      : `begin ${phase.toLowerCase()}`,
  }));

  return pipelineResultToReplay(
    runTurnPipeline(SCENARIO_MUTATED_MAIN_INTENT, initialState, phaseIntents),
  );
}
