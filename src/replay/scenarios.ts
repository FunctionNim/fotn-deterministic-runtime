/**
 * R12 — Named replay scenarios.
 * R13 — Updated to pass initialState and memoryIds to assembleResult so the
 *        canonical RuntimeSignature includes all required fields.
 *
 * Each exported function runs a complete, self-contained replay and returns a
 * ReplayResult that can be compared across two independent invocations to prove
 * determinism.
 */

import {
  applyStoneRoomAction,
  createRoomThatWouldNotFall,
  StonePuzzleRoomState,
} from '../runtime/playable-pressure.js';

import {
  createFirstContinuationState,
  runFirstContinuationLoop,
} from '../prototype/first-continuation-loop.js';

import { ReplayAction, ReplayFinalState, ReplayResult, assembleResult } from './replay-verifier.js';

// ─── Scenario IDs ─────────────────────────────────────────────────────────────

export const SCENARIO_ACT_I_STONE_ROOM = 'act-i:stone-room:that-would-not-fall';
export const SCENARIO_ACT_I_FORCED_FAILURE = 'act-i:stone-room:forced-failure';
export const SCENARIO_ACT_II_FIRST_LOOP = 'act-ii:first-continuation-loop';

// ─── Shared helpers ───────────────────────────────────────────────────────────

function stoneRoomFinalState(room: StonePuzzleRoomState): ReplayFinalState {
  return {
    phase: room.phase,
    pressureMeter: { ...room.pressureMeter },
    allPlatesDiscovered: room.anchorPlates.every((p) => p.discovered),
    allPlatesStabilized: room.anchorPlates.every((p) => p.stabilized),
    allPlatesReleased: room.anchorPlates.every((p) => p.released),
    returnOutput: room.returnOutput ?? null,
    ledgerEntryId: room.ledgerEntry?.entryId ?? null,
  };
}

// ─── Act I — Stone Room Scenario ─────────────────────────────────────────────

/**
 * Runs the complete Act I Stone Room sequence deterministically.
 *
 * Actions (17 total):
 *   EnterRoom
 *   TestAnchor + NameProtection + NameReleaseCondition + CastAnchorPulse + ReleaseAnchor  ×3 plates
 *   RecordLedger
 *
 * Audit trail: the ordered witnessRecords written by each action.
 */
export function actIStoneRoomScenario(): ReplayResult {
  const plates = ['plate:first', 'plate:second', 'plate:threshold'] as const;

  const actionLabels: string[] = ['EnterRoom'];
  for (const plateId of plates) {
    actionLabels.push(
      `TestAnchor(${plateId})`,
      `NameProtection(${plateId})`,
      `NameReleaseCondition(${plateId})`,
      `CastAnchorPulse(${plateId})`,
      `ReleaseAnchor(${plateId})`,
    );
  }
  actionLabels.push('RecordLedger');

  const orderedActions: ReplayAction[] = actionLabels.map((label, index) => ({ label, index }));

  // Capture initial state before any action is applied
  let room = createRoomThatWouldNotFall();
  const initialState = stoneRoomFinalState(room);

  // Execute the sequence
  room = applyStoneRoomAction(room, { type: 'EnterRoom' });

  for (const plateId of plates) {
    room = applyStoneRoomAction(room, { type: 'TestAnchor', plateId });
    room = applyStoneRoomAction(room, {
      type: 'NameProtection',
      plateId,
      protectionName: `shield the ${plateId.replace('plate:', '')} passage`,
    });
    room = applyStoneRoomAction(room, {
      type: 'NameReleaseCondition',
      plateId,
      releaseCondition: `release ${plateId} when the way forward is clear`,
    });
    room = applyStoneRoomAction(room, { type: 'CastAnchorPulse', plateId });
    room = applyStoneRoomAction(room, { type: 'ReleaseAnchor', plateId });
  }
  room = applyStoneRoomAction(room, { type: 'RecordLedger' });

  const finalState = stoneRoomFinalState(room);
  const auditTrail = [...room.witnessRecords];

  return assembleResult(SCENARIO_ACT_I_STONE_ROOM, orderedActions, initialState, finalState, auditTrail);
}

// ─── Act I — Forced Failure Scenario (mutation probe) ─────────────────────────

/**
 * Intentionally breaks Act I by forcing a failure on plate:first instead of
 * following the correct sequence.  Used to prove that changing an action
 * changes the signature.
 */
export function actIForcedFailureScenario(): ReplayResult {
  const orderedActions: ReplayAction[] = [
    { label: 'EnterRoom', index: 0 },
    { label: 'ForceBreak(plate:first)', index: 1 },
  ];

  let room = createRoomThatWouldNotFall();
  const initialState = stoneRoomFinalState(room);

  room = applyStoneRoomAction(room, { type: 'EnterRoom' });
  room = applyStoneRoomAction(room, { type: 'ForceBreak', plateId: 'plate:first' });

  const finalState = stoneRoomFinalState(room);
  const auditTrail = [...room.witnessRecords];

  return assembleResult(SCENARIO_ACT_I_FORCED_FAILURE, orderedActions, initialState, finalState, auditTrail);
}

// ─── Act II — First Continuation Loop Scenario ────────────────────────────────

/**
 * Replays the Act II First Continuation Loop.
 *
 * The "actions" are the seven logical steps of the loop in the order they
 * execute.  The audit trail is the ordered list of executed event IDs followed
 * by persisted memory IDs, reflecting the consequence of each step.
 *
 * memoryIds are passed separately so the RuntimeSignature can include a
 * dedicated memoryHash field.
 */
export function actIIFirstContinuationLoopScenario(): ReplayResult {
  const orderedActions: ReplayAction[] = [
    { label: 'Intent:Observe(starter)', index: 0 },
    { label: 'FunctionBox:ActivateSlot(0)', index: 1 },
    { label: 'Encounter:Escalate(pressure_alpha)', index: 2 },
    { label: 'Encounter:Stabilize+Resolve(pressure_alpha)', index: 3 },
    { label: 'Intent:Restore(starter)', index: 4 },
    { label: 'Heartbeat:Tick', index: 5 },
    { label: 'District:Update(starter)', index: 6 },
  ];

  // Capture initial state from the pre-run world
  const s0 = createFirstContinuationState();
  const seeker0 = s0.seekers.seeker_alpha;
  const district0 = s0.districts.starter;
  const encounter0 = s0.encounters.pressure_alpha;
  const initialState: ReplayFinalState = {
    tick: s0.tick,
    seekerPressureLevel: seeker0.pressureLevel,
    seekerResonanceStability: seeker0.resonance.stability,
    seekerCalm: seeker0.emotional.calm,
    seekerInTeaRitual: seeker0.restoration.inTeaRitual,
    districtPressureLevel: district0.pressureLevel,
    districtResonanceStability: district0.resonanceStability,
    districtRestorationProgress: district0.restorationProgress,
    encounterPhase: encounter0.phase,
    encounterResolved: encounter0.resolved,
  };

  const result = runFirstContinuationLoop();
  const s = result.state;
  const seeker = s.seekers.seeker_alpha;
  const district = s.districts.starter;
  const encounter = s.encounters.pressure_alpha;

  const finalState: ReplayFinalState = {
    tick: s.tick,
    seekerPressureLevel: seeker.pressureLevel,
    seekerResonanceStability: seeker.resonance.stability,
    seekerCalm: seeker.emotional.calm,
    seekerInTeaRitual: seeker.restoration.inTeaRitual,
    districtPressureLevel: district.pressureLevel,
    districtResonanceStability: district.resonanceStability,
    districtRestorationProgress: district.restorationProgress,
    encounterPhase: encounter.phase,
    encounterResolved: encounter.resolved,
  };

  // Audit trail: events first (in execution order), then memories
  const auditTrail: string[] = [
    ...result.executedEventIds,
    ...result.persistedMemoryIds,
  ];

  return assembleResult(
    SCENARIO_ACT_II_FIRST_LOOP,
    orderedActions,
    initialState,
    finalState,
    auditTrail,
    result.persistedMemoryIds,
  );
}

// ─── Initial state accessors (for documentation / test assertions) ─────────────

export function actIInitialStateDescription(): Record<string, unknown> {
  const room = createRoomThatWouldNotFall();
  return {
    roomId: room.roomId,
    phase: room.phase,
    pressureMeter: { ...room.pressureMeter },
    plateCount: room.anchorPlates.length,
  };
}

export function actIIInitialStateDescription(): Record<string, unknown> {
  const s = createFirstContinuationState();
  const seeker = s.seekers.seeker_alpha;
  const district = s.districts.starter;
  const encounter = s.encounters.pressure_alpha;
  return {
    tick: s.tick,
    seekerPressureLevel: seeker.pressureLevel,
    districtPressureLevel: district.pressureLevel,
    encounterPhase: encounter.phase,
    encounterResolved: encounter.resolved,
  };
}
