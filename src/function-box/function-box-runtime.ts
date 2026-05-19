import {
  FunctionRelationship,
  FunctionSlot,
  ResonanceModifier,
} from '../runtime/continuity-state.js';
import {
  FunctionType,
  RelationshipType,
  ResonanceType,
} from '../runtime/resonance-types.js';

export interface FunctionBoxRuntimeInput {
  readonly slots: FunctionSlot[];
  readonly relationships: FunctionRelationship[];
  readonly activatedSlotIndex: number;
}

export interface FunctionBoxRuntimeResult {
  readonly activatedSlot?: FunctionSlot;
  readonly affectedSlots: FunctionSlot[];
  readonly resonanceModifiers: ResonanceModifier[];
}

export class FunctionBoxRuntime {
  public activateSlot(input: FunctionBoxRuntimeInput): FunctionBoxRuntimeResult {
    const activatedSlot = input.slots.find(
      (slot) => slot.slotIndex === input.activatedSlotIndex,
    );

    if (!activatedSlot?.functionType) {
      return {
        activatedSlot,
        affectedSlots: [],
        resonanceModifiers: [],
      };
    }

    const affectedSlots = input.slots
      .filter((slot) => slot.functionType !== undefined)
      .map((slot) => applyRelationshipToSlot(
        activatedSlot.functionType as FunctionType,
        slot,
        input.relationships,
      ));

    const resonanceModifiers = affectedSlots.map((slot) => ({
      id: `function-slot:${activatedSlot.slotIndex}->${slot.slotIndex}`,
      source: activatedSlot.functionType as string,
      amount: resonanceAmountFor(slot.resonanceState),
    }));

    return {
      activatedSlot,
      affectedSlots,
      resonanceModifiers,
    };
  }
}

function applyRelationshipToSlot(
  source: FunctionType,
  slot: FunctionSlot,
  relationships: FunctionRelationship[],
): FunctionSlot {
  if (!slot.functionType) return slot;
  if (slot.functionType === source) {
    return {
      ...slot,
      resonanceState: ResonanceType.Synchronized,
    };
  }

  const relationship = relationships.find(
    (candidate) => candidate.source === source
      && candidate.target === slot.functionType,
  );

  if (!relationship) return slot;

  switch (relationship.relationship) {
    case RelationshipType.Dependency:
      return {
        ...slot,
        resonanceState: ResonanceType.Pressured,
      };
    case RelationshipType.Feed:
      return {
        ...slot,
        resonanceState: ResonanceType.Synchronized,
      };
    case RelationshipType.Opposition:
      return {
        ...slot,
        resonanceState: ResonanceType.Fractured,
      };
    case RelationshipType.Synchronization:
      return {
        ...slot,
        resonanceState: ResonanceType.Synchronized,
      };
    case RelationshipType.Neutral:
      return slot;
    default:
      return exhaustiveRelationshipCheck(relationship.relationship);
  }
}

function resonanceAmountFor(state: ResonanceType): number {
  switch (state) {
    case ResonanceType.Stable:
      return 0.1;
    case ResonanceType.Pressured:
      return -0.1;
    case ResonanceType.Synchronized:
      return 0.25;
    case ResonanceType.Fractured:
      return -0.25;
    case ResonanceType.Restoring:
      return 0.15;
    default:
      return exhaustiveResonanceCheck(state);
  }
}

function exhaustiveRelationshipCheck(value: never): never {
  throw new Error(`Unhandled Function relationship: ${String(value)}`);
}

function exhaustiveResonanceCheck(value: never): never {
  throw new Error(`Unhandled resonance state: ${String(value)}`);
}
