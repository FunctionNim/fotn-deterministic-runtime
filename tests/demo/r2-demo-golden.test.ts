import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';
import { runActIFixture, runActIIFixture, ActIFixture, ActIIFixture } from '../../src/demo/r2-demo-fixture.js';

// ─── Load locked artifacts ─────────────────────────────────────────────────────

const __dir = dirname(fileURLToPath(import.meta.url));

function loadJson(rel: string): Record<string, unknown> {
  return JSON.parse(readFileSync(join(__dir, rel), 'utf-8'));
}

const snapshot = loadJson('../golden/r2-demo-snapshot.json');
const manifest = loadJson('../golden/r2-demo-manifest.json');

const DRIFT_HINT =
  'Golden snapshot mismatch. If this change is intentional, run: npm run generate-snapshot';

// ─── Live fixture (computed once) ─────────────────────────────────────────────

let actI: ActIFixture;
let actII: ActIIFixture;

beforeAll(() => {
  actI = runActIFixture();
  actII = runActIIFixture();
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function snap(...keys: string[]): any {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return keys.reduce((obj: any, k) => obj?.[k], snapshot);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function man(...keys: string[]): any {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return keys.reduce((obj: any, k) => obj?.[k], manifest);
}

// ─── Manifest integrity ───────────────────────────────────────────────────────

describe('Audit manifest integrity', () => {
  it('manifest phase is R2-R3', () => {
    expect(manifest.phase).toBe('R2-R3');
  });

  it('manifest lockStatus is locked', () => {
    expect(manifest.lockStatus).toBe('locked');
  });

  it('manifest lists two demo acts', () => {
    expect((manifest.demoActs as unknown[]).length).toBe(2);
  });

  it('manifest fixtureSource points to r2-demo-fixture.ts', () => {
    expect(manifest.fixtureSource).toBe('src/demo/r2-demo-fixture.ts');
  });

  it('manifest snapshotSource points to r2-demo-snapshot.json', () => {
    expect(manifest.snapshotSource).toBe('tests/golden/r2-demo-snapshot.json');
  });

  it('manifest expectedActionSequenceCount matches snapshot stepCount', () => {
    expect(man('expectedActionSequenceCount')).toBe(snap('actI', 'stepCount'));
  });

  it('manifest expectedEventCount matches snapshot executedEventCount', () => {
    expect(man('expectedEventCount')).toBe(snap('actII', 'executedEventCount'));
  });

  it('manifest expectedWorldMemoryCount matches snapshot persistedMemoryCount', () => {
    expect(man('expectedWorldMemoryCount')).toBe(snap('actII', 'persistedMemoryCount'));
  });

  it('manifest deterministicFlags.actI is true', () => {
    expect(man('deterministicFlags', 'actI')).toBe(true);
  });

  it('manifest deterministicFlags.actIIEvents is true', () => {
    expect(man('deterministicFlags', 'actIIEvents')).toBe(true);
  });

  it('manifest deterministicFlags.actIIMemories is true', () => {
    expect(man('deterministicFlags', 'actIIMemories')).toBe(true);
  });

  it('manifest deterministicFlags.actIIState is true', () => {
    expect(man('deterministicFlags', 'actIIState')).toBe(true);
  });
});

// ─── Act I — snapshot vs. live fixture ────────────────────────────────────────

describe('Act I golden snapshot — spell seed', () => {
  it('name matches snapshot', () => {
    expect(actI.spellSeed.name, DRIFT_HINT).toBe(snap('actI', 'spellSeed', 'name'));
  });
  it('functionType matches snapshot', () => {
    expect(actI.spellSeed.functionType, DRIFT_HINT).toBe(snap('actI', 'spellSeed', 'functionType'));
  });
  it('containmentRule matches snapshot', () => {
    expect(actI.spellSeed.containmentRule, DRIFT_HINT).toBe(snap('actI', 'spellSeed', 'containmentRule'));
  });
  it('returnOutput matches snapshot', () => {
    expect(actI.spellSeed.returnOutput, DRIFT_HINT).toBe(snap('actI', 'spellSeed', 'returnOutput'));
  });
});

describe('Act I golden snapshot — trial gate', () => {
  it('fromFunction matches snapshot', () => {
    expect(actI.trialGate.fromFunction, DRIFT_HINT).toBe(snap('actI', 'trialGate', 'fromFunction'));
  });
  it('toFunction matches snapshot', () => {
    expect(actI.trialGate.toFunction, DRIFT_HINT).toBe(snap('actI', 'trialGate', 'toFunction'));
  });
  it('reversionWarning matches snapshot', () => {
    expect(actI.trialGate.reversionWarning, DRIFT_HINT).toBe(snap('actI', 'trialGate', 'reversionWarning'));
  });
});

describe('Act I golden snapshot — action sequence', () => {
  it('step count matches snapshot', () => {
    expect(actI.steps.length, DRIFT_HINT).toBe(snap('actI', 'stepCount'));
  });

  it('step count matches manifest expectedActionSequenceCount', () => {
    expect(actI.steps.length, DRIFT_HINT).toBe(man('expectedActionSequenceCount'));
  });

  it('all step actions match snapshot in order', () => {
    const snapshotActions = (snap('actI', 'steps') as Array<{ action: string }>).map((s) => s.action);
    const liveActions = actI.steps.map((s) => s.action);
    expect(liveActions, DRIFT_HINT).toEqual(snapshotActions);
  });

  it('all step phases match snapshot in order', () => {
    const snapshotPhases = (snap('actI', 'steps') as Array<{ phase: string }>).map((s) => s.phase);
    const livePhases = actI.steps.map((s) => s.phase);
    expect(livePhases, DRIFT_HINT).toEqual(snapshotPhases);
  });

  it('all step pressure meters match snapshot exactly', () => {
    const snapshotMeters = (snap('actI', 'steps') as Array<{ pressureMeter: unknown }>)
      .map((s) => s.pressureMeter);
    const liveMeters = actI.steps.map((s) => s.pressureMeter);
    expect(liveMeters, DRIFT_HINT).toEqual(snapshotMeters);
  });

  it('full step array matches snapshot exactly', () => {
    expect(actI.steps, DRIFT_HINT).toEqual(snap('actI', 'steps'));
  });
});

describe('Act I golden snapshot — initial state', () => {
  it('initial phase matches snapshot', () => {
    expect(actI.initialSnapshot.phase, DRIFT_HINT).toBe(snap('actI', 'initialSnapshot', 'phase'));
  });
  it('initial pressure meter matches snapshot', () => {
    expect(actI.initialSnapshot.pressureMeter, DRIFT_HINT)
      .toEqual(snap('actI', 'initialSnapshot', 'pressureMeter'));
  });
  it('initial plate flags match snapshot', () => {
    expect(actI.initialSnapshot.allPlatesDiscovered, DRIFT_HINT)
      .toBe(snap('actI', 'initialSnapshot', 'allPlatesDiscovered'));
    expect(actI.initialSnapshot.allPlatesStabilized, DRIFT_HINT)
      .toBe(snap('actI', 'initialSnapshot', 'allPlatesStabilized'));
    expect(actI.initialSnapshot.allPlatesReleased, DRIFT_HINT)
      .toBe(snap('actI', 'initialSnapshot', 'allPlatesReleased'));
  });
});

describe('Act I golden snapshot — final state', () => {
  it('final phase matches snapshot', () => {
    expect(actI.finalSnapshot.phase, DRIFT_HINT).toBe(snap('actI', 'finalSnapshot', 'phase'));
  });
  it('final returnOutput matches snapshot', () => {
    expect(actI.finalSnapshot.returnOutput, DRIFT_HINT)
      .toBe(snap('actI', 'finalSnapshot', 'returnOutput'));
  });
  it('final pressure meter matches snapshot exactly', () => {
    expect(actI.finalSnapshot.pressureMeter, DRIFT_HINT)
      .toEqual(snap('actI', 'finalSnapshot', 'pressureMeter'));
  });
  it('final plate flags match snapshot', () => {
    expect(actI.finalSnapshot.allPlatesDiscovered, DRIFT_HINT).toBe(true);
    expect(actI.finalSnapshot.allPlatesStabilized, DRIFT_HINT).toBe(true);
    expect(actI.finalSnapshot.allPlatesReleased, DRIFT_HINT).toBe(true);
  });
});

describe('Act I golden snapshot — ledger entry', () => {
  it('full ledger entry matches snapshot exactly', () => {
    expect(actI.ledgerEntry, DRIFT_HINT).toEqual(snap('actI', 'ledgerEntry'));
  });

  it('entryId matches snapshot', () => {
    expect(actI.ledgerEntry.entryId, DRIFT_HINT).toBe(snap('actI', 'ledgerEntry', 'entryId'));
  });

  it('functionTested matches snapshot', () => {
    expect(actI.ledgerEntry.functionTested, DRIFT_HINT)
      .toBe(snap('actI', 'ledgerEntry', 'functionTested'));
  });

  it('spellSeedId matches snapshot', () => {
    expect(actI.ledgerEntry.spellSeedId, DRIFT_HINT)
      .toBe(snap('actI', 'ledgerEntry', 'spellSeedId'));
  });

  it('reversionWarning matches snapshot', () => {
    expect(actI.ledgerEntry.reversionWarning, DRIFT_HINT)
      .toBe(snap('actI', 'ledgerEntry', 'reversionWarning'));
  });

  it('protected entries match snapshot', () => {
    expect(actI.ledgerEntry.protected, DRIFT_HINT).toEqual(snap('actI', 'ledgerEntry', 'protected'));
  });

  it('releaseConditionsNamed matches snapshot', () => {
    expect(actI.ledgerEntry.releaseConditionsNamed, DRIFT_HINT)
      .toEqual(snap('actI', 'ledgerEntry', 'releaseConditionsNamed'));
  });

  it('awaitingCollection matches snapshot', () => {
    expect(actI.ledgerEntry.awaitingCollection, DRIFT_HINT)
      .toEqual(snap('actI', 'ledgerEntry', 'awaitingCollection'));
  });
});

describe('Act I golden snapshot — determinism flag', () => {
  it('deterministicMatch is true and matches snapshot', () => {
    expect(actI.deterministicMatch, DRIFT_HINT).toBe(snap('actI', 'deterministicMatch'));
  });
});

// ─── Act II — snapshot vs. live fixture ───────────────────────────────────────

describe('Act II golden snapshot — event audit', () => {
  it('executedEventIds match snapshot exactly', () => {
    expect(actII.executedEventIds, DRIFT_HINT).toEqual(snap('actII', 'executedEventIds'));
  });

  it('event count matches snapshot', () => {
    expect(actII.executedEventIds.length, DRIFT_HINT).toBe(snap('actII', 'executedEventCount'));
  });

  it('event count matches manifest', () => {
    expect(actII.executedEventIds.length, DRIFT_HINT).toBe(man('expectedEventCount'));
  });
});

describe('Act II golden snapshot — world memory', () => {
  it('persistedMemoryIds match snapshot exactly', () => {
    expect(actII.persistedMemoryIds, DRIFT_HINT).toEqual(snap('actII', 'persistedMemoryIds'));
  });

  it('memory count matches snapshot', () => {
    expect(actII.persistedMemoryIds.length, DRIFT_HINT).toBe(snap('actII', 'persistedMemoryCount'));
  });

  it('memory count matches manifest', () => {
    expect(actII.persistedMemoryIds.length, DRIFT_HINT).toBe(man('expectedWorldMemoryCount'));
  });
});

describe('Act II golden snapshot — initial state', () => {
  it('full initial state matches snapshot exactly', () => {
    expect(actII.initialState, DRIFT_HINT).toEqual(snap('actII', 'initialState'));
  });
});

describe('Act II golden snapshot — final state', () => {
  it('full final state matches snapshot exactly', () => {
    expect(actII.finalState, DRIFT_HINT).toEqual(snap('actII', 'finalState'));
  });

  it('final tick matches snapshot', () => {
    expect(actII.finalState.tick, DRIFT_HINT).toBe(snap('actII', 'finalState', 'tick'));
  });

  it('encounterResolved matches snapshot', () => {
    expect(actII.finalState.encounterResolved, DRIFT_HINT)
      .toBe(snap('actII', 'finalState', 'encounterResolved'));
  });

  it('encounterPhase matches snapshot', () => {
    expect(actII.finalState.encounterPhase, DRIFT_HINT)
      .toBe(snap('actII', 'finalState', 'encounterPhase'));
  });

  it('seekerInTeaRitual matches snapshot', () => {
    expect(actII.finalState.seekerInTeaRitual, DRIFT_HINT)
      .toBe(snap('actII', 'finalState', 'seekerInTeaRitual'));
  });

  it('seekerCalm matches snapshot', () => {
    expect(actII.finalState.seekerCalm, DRIFT_HINT)
      .toBe(snap('actII', 'finalState', 'seekerCalm'));
  });

  it('districtPressureLevel matches snapshot', () => {
    expect(actII.finalState.districtPressureLevel, DRIFT_HINT)
      .toBe(snap('actII', 'finalState', 'districtPressureLevel'));
  });

  it('districtResonanceStability matches snapshot', () => {
    expect(actII.finalState.districtResonanceStability, DRIFT_HINT)
      .toBe(snap('actII', 'finalState', 'districtResonanceStability'));
  });
});

describe('Act II golden snapshot — determinism flags', () => {
  it('eventsDeterministic matches snapshot', () => {
    expect(actII.eventsDeterministic, DRIFT_HINT).toBe(snap('actII', 'eventsDeterministic'));
  });
  it('memoriesDeterministic matches snapshot', () => {
    expect(actII.memoriesDeterministic, DRIFT_HINT).toBe(snap('actII', 'memoriesDeterministic'));
  });
  it('stateDeterministic matches snapshot', () => {
    expect(actII.stateDeterministic, DRIFT_HINT).toBe(snap('actII', 'stateDeterministic'));
  });
});
