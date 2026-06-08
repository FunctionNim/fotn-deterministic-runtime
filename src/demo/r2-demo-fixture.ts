import {
  applyStoneRoomAction,
  createAnchorPulseSpellSeed,
  createRoomThatWouldNotFall,
  createStoneToClayTrialGate,
  ContinuityLedgerEntry,
  StonePuzzleRoomState,
  SpellSeed,
  TrialGate,
} from '../runtime/playable-pressure.js';

import {
  createFirstContinuationState,
  runFirstContinuationLoop,
  FirstContinuationLoopResult,
} from '../prototype/first-continuation-loop.js';

// ─── Act I types ──────────────────────────────────────────────────────────────

export interface ActIRoomSnapshot {
  readonly phase: string;
  readonly returnOutput: string | undefined;
  readonly pressureMeter: {
    readonly tremor: number;
    readonly seal: number;
    readonly passage: number;
  };
  readonly allPlatesReleased: boolean;
  readonly allPlatesDiscovered: boolean;
  readonly allPlatesStabilized: boolean;
}

export interface ActIStepRecord {
  readonly action: string;
  readonly phase: string;
  readonly pressureMeter: {
    readonly tremor: number;
    readonly seal: number;
    readonly passage: number;
  };
}

export interface ActIFixture {
  readonly spellSeed: SpellSeed;
  readonly trialGate: TrialGate;
  readonly initialSnapshot: ActIRoomSnapshot;
  readonly steps: readonly ActIStepRecord[];
  readonly finalSnapshot: ActIRoomSnapshot;
  readonly ledgerEntry: ContinuityLedgerEntry;
  readonly runA: ActIRoomSnapshot;
  readonly runB: ActIRoomSnapshot;
  readonly deterministicMatch: boolean;
}

// ─── Act II types ─────────────────────────────────────────────────────────────

export interface ActIIStateSnapshot {
  readonly tick: number;
  readonly seekerPressureLevel: number;
  readonly seekerResonanceStability: number;
  readonly seekerCalm: number;
  readonly seekerInTeaRitual: boolean;
  readonly districtPressureLevel: number;
  readonly districtResonanceStability: number;
  readonly districtRestorationProgress: number;
  readonly encounterPhase: string;
  readonly encounterResolved: boolean;
}

export interface ActIIFixture {
  readonly initialState: ActIIStateSnapshot;
  readonly executedEventIds: readonly string[];
  readonly persistedMemoryIds: readonly string[];
  readonly finalState: ActIIStateSnapshot;
  readonly runA: { readonly eventIds: readonly string[]; readonly memoryIds: readonly string[] };
  readonly runB: { readonly eventIds: readonly string[]; readonly memoryIds: readonly string[] };
  readonly eventsDeterministic: boolean;
  readonly memoriesDeterministic: boolean;
  readonly stateDeterministic: boolean;
}

// ─── Shared helpers ───────────────────────────────────────────────────────────

export function solveStoneRoom(): StonePuzzleRoomState {
  let room = createRoomThatWouldNotFall();
  room = applyStoneRoomAction(room, { type: 'EnterRoom' });
  for (const plateId of ['plate:first', 'plate:second', 'plate:threshold'] as const) {
    room = applyStoneRoomAction(room, { type: 'TestAnchor', plateId });
    room = applyStoneRoomAction(room, {
      type: 'NameProtection', plateId,
      protectionName: `shield the ${plateId.replace('plate:', '')} passage`,
    });
    room = applyStoneRoomAction(room, {
      type: 'NameReleaseCondition', plateId,
      releaseCondition: `release ${plateId} when the way forward is clear`,
    });
    room = applyStoneRoomAction(room, { type: 'CastAnchorPulse', plateId });
    room = applyStoneRoomAction(room, { type: 'ReleaseAnchor', plateId });
  }
  return room;
}

function roomSnapshot(room: StonePuzzleRoomState): ActIRoomSnapshot {
  return {
    phase: room.phase,
    returnOutput: room.returnOutput,
    pressureMeter: { ...room.pressureMeter },
    allPlatesReleased: room.anchorPlates.every((p) => p.released),
    allPlatesDiscovered: room.anchorPlates.every((p) => p.discovered),
    allPlatesStabilized: room.anchorPlates.every((p) => p.stabilized),
  };
}

function stateSnapshot(result: FirstContinuationLoopResult): ActIIStateSnapshot {
  const seeker = result.state.seekers.seeker_alpha;
  const district = result.state.districts.starter;
  const encounter = result.state.encounters.pressure_alpha;
  return {
    tick: result.state.tick,
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
}

function initialStateSnapshot(): ActIIStateSnapshot {
  const s = createFirstContinuationState();
  const seeker = s.seekers.seeker_alpha;
  const district = s.districts.starter;
  const encounter = s.encounters.pressure_alpha;
  return {
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
}

// ─── Act I fixture ────────────────────────────────────────────────────────────

export function runActIFixture(): ActIFixture {
  const spellSeed = createAnchorPulseSpellSeed();
  const trialGate = createStoneToClayTrialGate();

  let room = createRoomThatWouldNotFall();
  const initialSnapshot = roomSnapshot(room);
  const steps: ActIStepRecord[] = [];

  function step(action: Parameters<typeof applyStoneRoomAction>[1], label: string): void {
    room = applyStoneRoomAction(room, action);
    steps.push({ action: label, phase: room.phase, pressureMeter: { ...room.pressureMeter } });
  }

  step({ type: 'EnterRoom' }, 'EnterRoom');

  for (const plateId of ['plate:first', 'plate:second', 'plate:threshold'] as const) {
    step({ type: 'TestAnchor', plateId }, `TestAnchor(${plateId})`);
    step({
      type: 'NameProtection', plateId,
      protectionName: `shield the ${plateId.replace('plate:', '')} passage`,
    }, `NameProtection(${plateId})`);
    step({
      type: 'NameReleaseCondition', plateId,
      releaseCondition: `release ${plateId} when the way forward is clear`,
    }, `NameReleaseCondition(${plateId})`);
    step({ type: 'CastAnchorPulse', plateId }, `CastAnchorPulse(${plateId})`);
    step({ type: 'ReleaseAnchor', plateId }, `ReleaseAnchor(${plateId})`);
  }

  const finalSnapshot = roomSnapshot(room);
  room = applyStoneRoomAction(room, { type: 'RecordLedger' });

  if (!room.ledgerEntry) {
    throw new Error('Expected ledger entry after RecordLedger on resolved room.');
  }

  const runA = roomSnapshot(solveStoneRoom());
  const runB = roomSnapshot(solveStoneRoom());

  const deterministicMatch =
    runA.phase === runB.phase &&
    runA.returnOutput === runB.returnOutput &&
    runA.pressureMeter.passage === runB.pressureMeter.passage &&
    runA.pressureMeter.seal === runB.pressureMeter.seal &&
    runA.pressureMeter.tremor === runB.pressureMeter.tremor;

  return {
    spellSeed,
    trialGate,
    initialSnapshot,
    steps,
    finalSnapshot,
    ledgerEntry: room.ledgerEntry,
    runA,
    runB,
    deterministicMatch,
  };
}

// ─── Act II fixture ───────────────────────────────────────────────────────────

export function runActIIFixture(): ActIIFixture {
  const initial = initialStateSnapshot();
  const primary = runFirstContinuationLoop();

  const runA = runFirstContinuationLoop();
  const runB = runFirstContinuationLoop();

  const eventsDeterministic =
    JSON.stringify(runA.executedEventIds) === JSON.stringify(runB.executedEventIds);
  const memoriesDeterministic =
    JSON.stringify(runA.persistedMemoryIds) === JSON.stringify(runB.persistedMemoryIds);
  const stateDeterministic =
    runA.state.districts.starter.pressureLevel === runB.state.districts.starter.pressureLevel &&
    runA.state.seekers.seeker_alpha.resonance.stability ===
      runB.state.seekers.seeker_alpha.resonance.stability &&
    runA.state.encounters.pressure_alpha.resolved ===
      runB.state.encounters.pressure_alpha.resolved;

  return {
    initialState: initial,
    executedEventIds: primary.executedEventIds,
    persistedMemoryIds: primary.persistedMemoryIds,
    finalState: stateSnapshot(primary),
    runA: { eventIds: runA.executedEventIds, memoryIds: runA.persistedMemoryIds },
    runB: { eventIds: runB.executedEventIds, memoryIds: runB.persistedMemoryIds },
    eventsDeterministic,
    memoriesDeterministic,
    stateDeterministic,
  };
}
