import { describe, expect, it } from 'vitest';

import {
  EncounterRuntime,
  stabilizeEncounter,
} from '../../src/encounter/encounter-runtime.js';

import {
  EncounterPhase,
  ResonanceType,
} from '../../src/runtime/index.js';

describe('EncounterRuntime', () => {
  it('escalates encounter pressure deterministically', () => {
    const runtime = new EncounterRuntime();

    const result = runtime.update({
      generatedAtTick: 100,
      districtId: 'starter',
      encounter: {
        encounterId: 'encounter-alpha',
        phase: EncounterPhase.Entering,
        pressureLevel: 0.7,
        activeEffectIds: [],
        resolved: false,
        resonance: {
          stability: 0.5,
          synchronization: 0.4,
          distortion: 0.2,
          emotionalIntensity: 0.6,
          primaryType: ResonanceType.Pressured,
          activeModifiers: [],
        },
      },
    });

    expect(result.encounter.phase)
      .toBe(EncounterPhase.Escalating);

    expect(result.emittedEvents.length)
      .toBeGreaterThan(0);
  });

  it('stabilizes encounters through restoration influence', () => {
    const stabilized = stabilizeEncounter({
      encounterId: 'encounter-beta',
      phase: EncounterPhase.Escalating,
      pressureLevel: 0.6,
      activeEffectIds: [],
      resolved: false,
      resonance: {
        stability: 0.4,
        synchronization: 0.3,
        distortion: 0.5,
        emotionalIntensity: 0.5,
        primaryType: ResonanceType.Pressured,
        activeModifiers: [],
      },
    }, 0.4);

    expect(stabilized.resonance.stability)
      .toBeGreaterThan(0.4);

    expect(stabilized.resonance.primaryType)
      .toBe(ResonanceType.Restoring);
  });
});
