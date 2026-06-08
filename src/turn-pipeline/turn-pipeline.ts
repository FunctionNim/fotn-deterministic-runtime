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

export const SCENARIO_FIRST_CLEAN_TURN          = 'turn-pipeline:first-clean-turn';
export const SCENARIO_MUTATED_MAIN_INTENT       = 'turn-pipeline:mutated-main-intent';
export const SCENARIO_INVALID_PHASE_ORDER       = 'turn-pipeline:invalid-phase-order';
export const SCENARIO_FAILURE_THEN_CLEAN_RECOVERY = 'turn-pipeline:failure-then-clean-recovery';

// ─── Failure guard types ───────────────────────────────────────────────────────

/** Stable failure codes produced by the guarded pipeline. */
export type FailureCode = 'OUT_OF_ORDER_PHASE';

/**
 * Structured failure result returned by runTurnPipelineGuarded when an
 * invalid or out-of-order phase intent is detected.
 *
 * Never throws — the failure is captured as data so callers can assert on
 * every field deterministically.
 */
export interface FailureGuardResult {
  /** Stable scenario identifier. */
  readonly scenarioId: string;
  /** Stable machine-readable code for this class of failure. */
  readonly failureCode: FailureCode;
  /** The phase the pipeline expected next, according to PHASE_ORDER. */
  readonly expectedPhase: TurnPhase;
  /** The phase intent that was actually received. */
  readonly receivedPhase: TurnPhase;
  /** Human-readable explanation of why this transition is illegal. */
  readonly failureReason: string;
  /**
   * Snapshot of the turn state at the moment of failure — only phases that
   * completed before the bad intent are reflected here.
   */
  readonly priorStateSummary: Readonly<Record<string, unknown>>;
  /** Ordered audit events for every phase that completed before the failure. */
  readonly auditTrailUpToFailure: readonly string[];
  /**
   * Deterministic signature derived from all failure fields.
   * Two identical invalid replays produce the same signature.
   */
  readonly failureSignature: RuntimeSignature;
}

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

// ─── Guarded pipeline ─────────────────────────────────────────────────────────

/**
 * Type guard — returns true when `value` is a FailureGuardResult rather than
 * a TurnPipelineResult.
 */
export function isFailureGuardResult(
  value: TurnPipelineResult | FailureGuardResult,
): value is FailureGuardResult {
  return 'failureCode' in value;
}

/**
 * Guarded turn pipeline.
 *
 * Validates each phase intent against PHASE_ORDER before executing it.
 * Returns a FailureGuardResult at the first out-of-order phase instead of
 * continuing with corrupted state.  Never throws.
 *
 * If all intents are valid, delegates to runTurnPipeline and returns its result.
 */
export function runTurnPipelineGuarded(
  scenarioId: string,
  initialState: TurnState,
  phaseIntents: readonly PhaseIntent[],
): TurnPipelineResult | FailureGuardResult {
  const auditSoFar: string[] = [];
  const actionsSoFar: ReplayAction[] = [];
  let state: TurnState = { ...initialState };

  for (let i = 0; i < PHASE_ORDER.length; i++) {
    const expectedPhase = PHASE_ORDER[i];
    const intent        = phaseIntents[i];
    const receivedPhase = intent?.phase ?? expectedPhase;

    if (receivedPhase !== expectedPhase) {
      const priorStateSummary: Readonly<Record<string, unknown>> = {
        turnId: state.turnId,
        currentPhase: state.currentPhase,
        pressureLevel: state.pressureLevel,
        resolved: state.resolved,
        completedPhaseCount: state.completedPhases.length,
      };

      const failureReason =
        `Phase order violation: expected '${expectedPhase}' at position ${i} ` +
        `but received '${receivedPhase}'. Required order is ${PHASE_ORDER.join(' → ')}.`;

      const failureSignature = buildRuntimeSignature({
        scenarioId,
        initialState: {
          turnId: initialState.turnId,
          currentPhase: initialState.currentPhase,
          pressureLevel: initialState.pressureLevel,
          resolved: initialState.resolved,
          completedPhaseCount: initialState.completedPhases.length,
        },
        orderedActions: actionsSoFar,
        finalState: priorStateSummary,
        auditTrail: auditSoFar,
        deterministicProof: true,
      });

      return Object.freeze({
        scenarioId,
        failureCode: 'OUT_OF_ORDER_PHASE' as const,
        expectedPhase,
        receivedPhase,
        failureReason,
        priorStateSummary,
        auditTrailUpToFailure: [...auditSoFar],
        failureSignature,
      });
    }

    // Phase is valid — advance state
    const label = intent.label;
    state = {
      ...state,
      currentPhase: expectedPhase,
      completedPhases: [...state.completedPhases, expectedPhase],
      resolved: expectedPhase === 'EndOfTurn',
    };
    auditSoFar.push(`phase:${expectedPhase} — ${label}`);
    actionsSoFar.push({ label: `${expectedPhase}:${label}`, index: i });
  }

  // All phases valid — return a normal TurnPipelineResult
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
    orderedActions: actionsSoFar,
    finalState: finalStateSerialisable,
    auditTrail: auditSoFar,
    deterministicProof: true,
  });

  return {
    scenarioId,
    initialState,
    finalState: state,
    phaseTransitions: [...auditSoFar.map((_, i) => PHASE_ORDER[i])],
    auditTrail: auditSoFar,
    orderedActions: actionsSoFar,
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

// ─── Invalid Phase Order Scenario ──────────────────────────────────────────────

/**
 * R19 — Intentional invalid phase order scenario.
 *
 * Attempts StartOfTurn then immediately Main, skipping required Upkeep.
 * runTurnPipelineGuarded catches the violation and returns a FailureGuardResult.
 *
 * This function converts the failure into a ReplayResult so it can be
 * registered in the Scenario Registry and inspected through the Audit Fixture:
 *   - auditTrail = [StartOfTurn event, FAILURE event]
 *   - finalState = priorStateSummary at failure
 *   - signature captures everything deterministically
 *
 * Proves that invalid inputs are rejected clearly and that the failure itself
 * is stable and regression-protected.
 */
export function invalidPhaseOrderScenario(): ReplayResult {
  const initialState: TurnState = {
    turnId: 'turn-fail',
    currentPhase: null,
    completedPhases: [],
    pressureLevel: 0,
    resolved: false,
  };

  // StartOfTurn → Main  (Main at index 1, expected Upkeep)
  const phaseIntents: PhaseIntent[] = [
    { phase: 'StartOfTurn', label: 'begin startofturn' },
    { phase: 'Main',        label: 'begin main' },
    { phase: 'Upkeep',     label: 'begin upkeep' },
    { phase: 'Journey',    label: 'begin journey' },
    { phase: 'Alchemist',  label: 'begin alchemist' },
    { phase: 'Combat',     label: 'begin combat' },
    { phase: 'EndOfTurn',  label: 'begin endofturn' },
  ];

  const guardResult = runTurnPipelineGuarded(
    SCENARIO_INVALID_PHASE_ORDER,
    initialState,
    phaseIntents,
  );

  if (!isFailureGuardResult(guardResult)) {
    throw new Error(
      'invalidPhaseOrderScenario: expected FailureGuardResult but pipeline succeeded',
    );
  }

  // Compose the audit trail: completed events + a stable failure marker
  const failureEvent =
    `FAILURE:${guardResult.failureCode} — expected ${guardResult.expectedPhase}, ` +
    `received ${guardResult.receivedPhase}`;
  const auditTrail: string[] = [...guardResult.auditTrailUpToFailure, failureEvent];

  // Attempted ordered actions: completed phases + the failing intent
  const orderedActions: ReplayAction[] = [
    ...guardResult.auditTrailUpToFailure.map((e, i) => ({
      label: e.replace('phase:', '').split(' — ')[0] + ':' +
             e.split(' — ')[1],
      index: i,
    })),
    {
      label: `${guardResult.receivedPhase}:begin ${guardResult.receivedPhase.toLowerCase()} [REJECTED]`,
      index: guardResult.auditTrailUpToFailure.length,
    },
  ];

  const replayInitialState: ReplayFinalState = {
    turnId: initialState.turnId,
    currentPhase: initialState.currentPhase,
    pressureLevel: initialState.pressureLevel,
    resolved: initialState.resolved,
    completedPhaseCount: initialState.completedPhases.length,
  };

  return assembleResult(
    SCENARIO_INVALID_PHASE_ORDER,
    orderedActions,
    replayInitialState,
    guardResult.priorStateSummary,
    auditTrail,
  );
}

// ─── Recovery types and helpers ───────────────────────────────────────────────

/**
 * Structured result from a full failure-then-recovery run.
 *
 * Contains both halves so tests can assert on each independently:
 *   - failureHalf: the contained invalid-phase-order rejection
 *   - recoveryHalf: the subsequent fresh clean turn
 */
export interface TurnPhaseRecoveryResult {
  readonly scenarioId: string;
  readonly failureHalf: Readonly<{
    failureCode: FailureCode;
    expectedPhase: TurnPhase;
    receivedPhase: TurnPhase;
    failureReason: string;
    priorStateSummary: Readonly<Record<string, unknown>>;
    auditTrailUpToFailure: readonly string[];
    failureSignature: RuntimeSignature;
  }>;
  readonly recoveryHalf: Readonly<{
    finalState: TurnState;
    auditTrail: readonly string[];
    signature: RuntimeSignature;
  }>;
  /** True when the failure half produced a FailureGuardResult (never threw). */
  readonly failureContained: boolean;
  /** True when the recovery half completed all phases with resolved: true. */
  readonly recoverySucceeded: boolean;
}

/**
 * R20 — Run a failure-then-recovery sequence and return a structured result.
 *
 * Step 1: run the invalid phase order sequence (StartOfTurn → Main, skipping
 *         required Upkeep) through runTurnPipelineGuarded → FailureGuardResult.
 * Step 2: run a fresh valid clean turn (all 7 phases in PHASE_ORDER) using
 *         the same initial state and intents as firstCleanTurnScenario.
 *
 * The two halves share no state — the clean turn always starts from a pristine
 * TurnState, proving the failure cannot contaminate subsequent sequences.
 */
export function runTurnPhaseRecovery(): TurnPhaseRecoveryResult {
  // ── Failure half ─────────────────────────────────────────────────────────
  const failureInitial: TurnState = {
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

  const guardResult = runTurnPipelineGuarded(
    SCENARIO_INVALID_PHASE_ORDER,
    failureInitial,
    invalidIntents,
  );

  if (!isFailureGuardResult(guardResult)) {
    throw new Error('runTurnPhaseRecovery: failure half unexpectedly succeeded');
  }

  // ── Recovery half ─────────────────────────────────────────────────────────
  // Identical to firstCleanTurnScenario — same turnId, same intents —
  // proving that recovering from a failure produces the exact same result
  // as running a clean turn from scratch.
  const recoveryInitial: TurnState = {
    turnId: 'turn-1',
    currentPhase: null,
    completedPhases: [],
    pressureLevel: 0,
    resolved: false,
  };

  const validIntents: PhaseIntent[] = PHASE_ORDER.map((phase) => ({
    phase,
    label: `begin ${phase.toLowerCase()}`,
  }));

  const cleanResult = runTurnPipeline(
    SCENARIO_FIRST_CLEAN_TURN,
    recoveryInitial,
    validIntents,
  );

  return {
    scenarioId: SCENARIO_FAILURE_THEN_CLEAN_RECOVERY,
    failureHalf: {
      failureCode:            guardResult.failureCode,
      expectedPhase:          guardResult.expectedPhase,
      receivedPhase:          guardResult.receivedPhase,
      failureReason:          guardResult.failureReason,
      priorStateSummary:      guardResult.priorStateSummary,
      auditTrailUpToFailure:  guardResult.auditTrailUpToFailure,
      failureSignature:       guardResult.failureSignature,
    },
    recoveryHalf: {
      finalState:  cleanResult.finalState,
      auditTrail:  cleanResult.auditTrail,
      signature:   cleanResult.signature,
    },
    failureContained:  true,
    recoverySucceeded: cleanResult.finalState.resolved,
  };
}

/**
 * R20 — Failure-then-clean-recovery scenario returning a ReplayResult.
 *
 * Converts the two-halves result into a single ReplayResult so it can be
 * registered in the Scenario Registry and inspected through the Audit Fixture.
 *
 * Combined audit trail (10 events):
 *   1 StartOfTurn (from failure half)
 *   1 FAILURE:OUT_OF_ORDER_PHASE event
 *   1 RECOVERY:START separator
 *   7 clean phase events (from recovery half)
 *
 * Combined ordered actions (9):
 *   2 from failure half (StartOfTurn completed + Main rejected)
 *   7 from recovery half (all phases)
 *
 * finalState = recovery half's final state (resolved: true)
 * initialState = failure half's initial state (before anything ran)
 */
export function failureThenCleanRecoveryScenario(): ReplayResult {
  const rec = runTurnPhaseRecovery();

  const failureEvent =
    `FAILURE:${rec.failureHalf.failureCode} — expected ${rec.failureHalf.expectedPhase}, ` +
    `received ${rec.failureHalf.receivedPhase}`;

  const combinedAuditTrail: string[] = [
    ...rec.failureHalf.auditTrailUpToFailure,
    failureEvent,
    'RECOVERY:START — fresh clean turn begins',
    ...rec.recoveryHalf.auditTrail,
  ];

  // Failure actions: completed phases + the rejected intent
  const failureActions: ReplayAction[] = [
    ...rec.failureHalf.auditTrailUpToFailure.map((e, i) => ({
      label: e.replace('phase:', '').split(' — ')[0] + ':' + e.split(' — ')[1],
      index: i,
    })),
    {
      label: `${rec.failureHalf.receivedPhase}:begin ${rec.failureHalf.receivedPhase.toLowerCase()} [REJECTED]`,
      index: rec.failureHalf.auditTrailUpToFailure.length,
    },
  ];

  // Recovery actions: one per clean-turn phase
  const recoveryActions: ReplayAction[] = rec.recoveryHalf.auditTrail.map((e, i) => ({
    label: e.replace('phase:', '').split(' — ')[0] + ':' + e.split(' — ')[1],
    index: failureActions.length + i,
  }));

  const combinedActions: ReplayAction[] = [...failureActions, ...recoveryActions];

  const initialStateSerialisable: ReplayFinalState = {
    turnId: 'turn-fail',
    currentPhase: null,
    pressureLevel: 0,
    resolved: false,
    completedPhaseCount: 0,
  };

  const finalStateSerialisable: ReplayFinalState = {
    turnId: rec.recoveryHalf.finalState.turnId,
    currentPhase: rec.recoveryHalf.finalState.currentPhase,
    pressureLevel: rec.recoveryHalf.finalState.pressureLevel,
    resolved: rec.recoveryHalf.finalState.resolved,
    completedPhaseCount: rec.recoveryHalf.finalState.completedPhases.length,
  };

  return assembleResult(
    SCENARIO_FAILURE_THEN_CLEAN_RECOVERY,
    combinedActions,
    initialStateSerialisable,
    finalStateSerialisable,
    combinedAuditTrail,
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
