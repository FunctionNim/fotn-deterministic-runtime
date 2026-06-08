import { describe, it, expect, beforeAll } from 'vitest';
import { runActIFixture, runActIIFixture, ActIFixture, ActIIFixture } from '../../src/demo/r2-demo-fixture.js';

// ─── Fixtures (computed once per suite) ───────────────────────────────────────

let actI: ActIFixture;
let actII: ActIIFixture;

beforeAll(() => {
  actI = runActIFixture();
  actII = runActIIFixture();
});

// ─── Act I — Stone Room Regression ────────────────────────────────────────────

describe('Act I — Stone Room regression fixture', () => {

  describe('spell seed', () => {
    it('name is Anchor Pulse', () => {
      expect(actI.spellSeed.name).toBe('Anchor Pulse');
    });
    it('function type is Stone', () => {
      expect(actI.spellSeed.functionType).toBe('Stone');
    });
    it('containment rule mentions release condition', () => {
      expect(actI.spellSeed.containmentRule).toContain('release condition');
    });
    it('return output contains Living Stability', () => {
      expect(actI.spellSeed.returnOutput).toContain('Living Stability');
    });
  });

  describe('trial gate', () => {
    it('transitions from Stone to Clay', () => {
      expect(actI.trialGate.fromFunction).toBe('Stone');
      expect(actI.trialGate.toFunction).toBe('Clay');
    });
    it('reversion warning is Burial', () => {
      expect(actI.trialGate.reversionWarning).toBe('Burial');
    });
  });

  describe('initial room state', () => {
    it('starts Dormant', () => {
      expect(actI.initialSnapshot.phase).toBe('Dormant');
    });
    it('tremor starts at 1, seal and passage at 0', () => {
      expect(actI.initialSnapshot.pressureMeter.tremor).toBe(1);
      expect(actI.initialSnapshot.pressureMeter.seal).toBe(0);
      expect(actI.initialSnapshot.pressureMeter.passage).toBe(0);
    });
    it('no plates discovered, stabilized, or released', () => {
      expect(actI.initialSnapshot.allPlatesDiscovered).toBe(false);
      expect(actI.initialSnapshot.allPlatesStabilized).toBe(false);
      expect(actI.initialSnapshot.allPlatesReleased).toBe(false);
    });
  });

  describe('action sequence steps', () => {
    it('produces exactly 16 steps (1 EnterRoom + 5 per plate × 3 plates)', () => {
      expect(actI.steps.length).toBe(16);
    });

    it('first step is EnterRoom and transitions to Entered', () => {
      expect(actI.steps[0].action).toBe('EnterRoom');
      expect(actI.steps[0].phase).toBe('Entered');
    });

    it('last step resolves the room', () => {
      const last = actI.steps[actI.steps.length - 1];
      expect(last.action).toBe('ReleaseAnchor(plate:threshold)');
      expect(last.phase).toBe('Resolved');
    });

    it('passage strictly increases across CastAnchorPulse steps', () => {
      const castSteps = actI.steps.filter((s) => s.action.startsWith('CastAnchorPulse'));
      expect(castSteps.length).toBe(3);
      for (let i = 1; i < castSteps.length; i++) {
        expect(castSteps[i].pressureMeter.passage).toBeGreaterThan(
          castSteps[i - 1].pressureMeter.passage,
        );
      }
    });

    it('seal returns to 0 after every ReleaseAnchor step', () => {
      const releaseSteps = actI.steps.filter((s) => s.action.startsWith('ReleaseAnchor'));
      expect(releaseSteps.length).toBe(3);
      for (const step of releaseSteps) {
        expect(step.pressureMeter.seal).toBe(0);
      }
    });

    it('no step enters a Failed phase', () => {
      for (const step of actI.steps) {
        expect(step.phase).not.toBe('Failed');
      }
    });
  });

  describe('final room state', () => {
    it('phase is Resolved', () => {
      expect(actI.finalSnapshot.phase).toBe('Resolved');
    });
    it('return output contains Living Stability', () => {
      expect(actI.finalSnapshot.returnOutput).toContain('Living Stability');
    });
    it('passage is 1 (fully open)', () => {
      expect(actI.finalSnapshot.pressureMeter.passage).toBe(1);
    });
    it('seal is 0 (no dead law)', () => {
      expect(actI.finalSnapshot.pressureMeter.seal).toBe(0);
    });
    it('all plates discovered, stabilized, and released', () => {
      expect(actI.finalSnapshot.allPlatesDiscovered).toBe(true);
      expect(actI.finalSnapshot.allPlatesStabilized).toBe(true);
      expect(actI.finalSnapshot.allPlatesReleased).toBe(true);
    });
  });

  describe('ledger entry', () => {
    it('entry ID is stable', () => {
      expect(actI.ledgerEntry.entryId).toBe('ledger:room:stone:that-would-not-fall');
    });
    it('function tested is Stone', () => {
      expect(actI.ledgerEntry.functionTested).toBe('Stone');
    });
    it('spell seed ID is stable', () => {
      expect(actI.ledgerEntry.spellSeedId).toBe('spell-seed:stone:anchor-pulse');
    });
    it('reversion warning is Burial', () => {
      expect(actI.ledgerEntry.reversionWarning).toBe('Burial');
    });
    it('return output contains Living Stability', () => {
      expect(actI.ledgerEntry.returnOutput).toContain('Living Stability');
    });
    it('exactly 3 release conditions named (one per plate)', () => {
      expect(actI.ledgerEntry.releaseConditionsNamed.length).toBe(3);
    });
    it('exactly 3 protections recorded', () => {
      expect(actI.ledgerEntry.protected.length).toBe(3);
    });
    it('witness confirmation is present', () => {
      expect(actI.ledgerEntry.witnessConfirmation.length).toBeGreaterThan(0);
    });
    it('awaiting collection is non-empty', () => {
      expect(actI.ledgerEntry.awaitingCollection.length).toBeGreaterThan(0);
    });
  });

  describe('determinism proof', () => {
    it('two independent runs produce identical phase', () => {
      expect(actI.runA.phase).toBe(actI.runB.phase);
    });
    it('two independent runs produce identical passage', () => {
      expect(actI.runA.pressureMeter.passage).toBe(actI.runB.pressureMeter.passage);
    });
    it('two independent runs produce identical seal', () => {
      expect(actI.runA.pressureMeter.seal).toBe(actI.runB.pressureMeter.seal);
    });
    it('two independent runs produce identical tremor', () => {
      expect(actI.runA.pressureMeter.tremor).toBe(actI.runB.pressureMeter.tremor);
    });
    it('deterministicMatch flag is true', () => {
      expect(actI.deterministicMatch).toBe(true);
    });
  });

});

// ─── Act II — Continuation Loop Regression ────────────────────────────────────

describe('Act II — Continuation Loop regression fixture', () => {

  describe('initial world state', () => {
    it('starts at tick 0', () => {
      expect(actII.initialState.tick).toBe(0);
    });
    it('encounter starts in Entering phase', () => {
      expect(actII.initialState.encounterPhase).toBe('Entering');
    });
    it('encounter starts unresolved', () => {
      expect(actII.initialState.encounterResolved).toBe(false);
    });
    it('seeker is not in tea ritual at start', () => {
      expect(actII.initialState.seekerInTeaRitual).toBe(false);
    });
  });

  describe('event audit', () => {
    it('executes at least one event', () => {
      expect(actII.executedEventIds.length).toBeGreaterThan(0);
    });
    it('executes exactly 3 events', () => {
      expect(actII.executedEventIds.length).toBe(3);
    });
    it('observation event is present', () => {
      expect(actII.executedEventIds).toContain('intent:observe-starter');
    });
    it('encounter resolved event is present', () => {
      expect(actII.executedEventIds.some((id) => id.includes('resolved'))).toBe(true);
    });
    it('restoration event is present', () => {
      expect(actII.executedEventIds).toContain('intent:restore-after-pressure');
    });
    it('event order is stable across runs', () => {
      expect(actII.runA.eventIds).toEqual(actII.runB.eventIds);
    });
  });

  describe('world memory', () => {
    it('persists at least one memory', () => {
      expect(actII.persistedMemoryIds.length).toBeGreaterThan(0);
    });
    it('persists exactly 2 memories', () => {
      expect(actII.persistedMemoryIds.length).toBe(2);
    });
    it('encounter resolved memory is present', () => {
      expect(actII.persistedMemoryIds.some((id) => id.includes('resolved'))).toBe(true);
    });
    it('restoration memory is present', () => {
      expect(actII.persistedMemoryIds.some((id) => id.includes('restore'))).toBe(true);
    });
    it('memory order is stable across runs', () => {
      expect(actII.runA.memoryIds).toEqual(actII.runB.memoryIds);
    });
  });

  describe('final state', () => {
    it('tick advances to 1', () => {
      expect(actII.finalState.tick).toBe(1);
    });
    it('encounter is resolved', () => {
      expect(actII.finalState.encounterResolved).toBe(true);
    });
    it('encounter phase is Resolved', () => {
      expect(actII.finalState.encounterPhase).toBe('Resolved');
    });
    it('seeker enters tea ritual', () => {
      expect(actII.finalState.seekerInTeaRitual).toBe(true);
    });
    it('seeker calm increases from initial', () => {
      expect(actII.finalState.seekerCalm).toBeGreaterThan(actII.initialState.seekerCalm);
    });
    it('district pressure decreases from initial', () => {
      expect(actII.finalState.districtPressureLevel).toBeLessThan(
        actII.initialState.districtPressureLevel,
      );
    });
    it('district resonance stability increases from initial', () => {
      expect(actII.finalState.districtResonanceStability).toBeGreaterThan(
        actII.initialState.districtResonanceStability,
      );
    });
    it('district restoration progress increases from initial', () => {
      expect(actII.finalState.districtRestorationProgress).toBeGreaterThan(
        actII.initialState.districtRestorationProgress,
      );
    });
    it('seeker resonance stability is positive', () => {
      expect(actII.finalState.seekerResonanceStability).toBeGreaterThan(0);
    });
  });

  describe('determinism proof', () => {
    it('events are deterministic across runs', () => {
      expect(actII.eventsDeterministic).toBe(true);
    });
    it('memories are deterministic across runs', () => {
      expect(actII.memoriesDeterministic).toBe(true);
    });
    it('final state is deterministic across runs', () => {
      expect(actII.stateDeterministic).toBe(true);
    });
  });

});
