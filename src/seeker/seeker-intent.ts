import { EventType, ResonanceType } from '../runtime/index.js';
import type { ContinuityEvent } from '../runtime/index.js';

export enum SeekerIntentType {
  Move = 'Move',
  Observe = 'Observe',
  Interact = 'Interact',
  Restore = 'Restore',
  ActivateFunctionSlot = 'ActivateFunctionSlot',
}

export enum InputSurface {
  Desktop = 'Desktop',
  Mobile = 'Mobile',
  Controller = 'Controller',
}

export interface SeekerIntent {
  readonly intentId: string;
  readonly seekerId: string;
  readonly type: SeekerIntentType;
  readonly surface: InputSurface;
  readonly targetId?: string;
  readonly slotIndex?: number;
  readonly generatedAtTick: number;
}

export function intentToContinuityEvent(intent: SeekerIntent): ContinuityEvent {
  switch (intent.type) {
    case SeekerIntentType.Move:
      return baseEvent(intent, EventType.PressureShift, ResonanceType.Stable, 0.1, 0.1);
    case SeekerIntentType.Observe:
      return baseEvent(intent, EventType.MemoryPropagated, ResonanceType.Stable, 0.2, 0.15);
    case SeekerIntentType.Interact:
      return baseEvent(intent, EventType.EncounterEntered, ResonanceType.Pressured, 0.4, 0.35);
    case SeekerIntentType.Restore:
      return baseEvent(intent, EventType.RestorationApplied, ResonanceType.Restoring, 0.6, 0.5);
    case SeekerIntentType.ActivateFunctionSlot:
      return baseEvent(intent, EventType.FunctionRelationshipChanged, ResonanceType.Synchronized, 0.35, 0.3);
    default:
      return exhaustiveIntentCheck(intent.type);
  }
}

function baseEvent(
  intent: SeekerIntent,
  type: EventType,
  resonance: ResonanceType,
  emotionalWeight: number,
  propagationStrength: number,
): ContinuityEvent {
  return {
    eventId: `intent:${intent.intentId}`,
    type,
    resonance,
    emotionalWeight,
    propagationStrength,
    affectedDistricts: intent.targetId ? [intent.targetId] : [],
    generatedAtTick: intent.generatedAtTick,
  };
}

function exhaustiveIntentCheck(value: never): never {
  throw new Error(`Unhandled Seeker intent type: ${String(value)}`);
}
