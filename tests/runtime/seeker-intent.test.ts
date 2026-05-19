import { describe, expect, it } from 'vitest';

import {
  InputSurface,
  intentToContinuityEvent,
  SeekerIntentType,
} from '../../src/seeker/seeker-intent.js';

import {
  EventType,
  ResonanceType,
} from '../../src/runtime/index.js';

describe('Seeker intent propagation', () => {
  it('converts restoration intent into restoration event', () => {
    const event = intentToContinuityEvent({
      intentId: 'restore-1',
      seekerId: 'seeker-alpha',
      type: SeekerIntentType.Restore,
      surface: InputSurface.Mobile,
      targetId: 'starter',
      generatedAtTick: 10,
    });

    expect(event.type).toBe(EventType.RestorationApplied);
    expect(event.resonance).toBe(ResonanceType.Restoring);
    expect(event.affectedDistricts).toEqual(['starter']);
  });

  it('converts function activation into synchronized event', () => {
    const event = intentToContinuityEvent({
      intentId: 'slot-1',
      seekerId: 'seeker-alpha',
      type: SeekerIntentType.ActivateFunctionSlot,
      surface: InputSurface.Desktop,
      slotIndex: 2,
      generatedAtTick: 11,
    });

    expect(event.type).toBe(EventType.FunctionRelationshipChanged);
    expect(event.resonance).toBe(ResonanceType.Synchronized);
  });
});
