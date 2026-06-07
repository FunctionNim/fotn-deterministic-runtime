import { RelationshipType, ResonanceType, } from '../runtime/resonance-types.js';
export class FunctionBoxRuntime {
    activateSlot(input) {
        const activatedSlot = input.slots.find((slot) => slot.slotIndex === input.activatedSlotIndex);
        if (!activatedSlot?.functionType) {
            return {
                activatedSlot,
                affectedSlots: [],
                resonanceModifiers: [],
            };
        }
        const affectedSlots = input.slots
            .filter((slot) => slot.functionType !== undefined)
            .map((slot) => applyRelationshipToSlot(activatedSlot.functionType, slot, input.relationships));
        const resonanceModifiers = affectedSlots.map((slot) => ({
            id: `function-slot:${activatedSlot.slotIndex}->${slot.slotIndex}`,
            source: activatedSlot.functionType,
            amount: resonanceAmountFor(slot.resonanceState),
        }));
        return {
            activatedSlot,
            affectedSlots,
            resonanceModifiers,
        };
    }
}
function applyRelationshipToSlot(source, slot, relationships) {
    if (!slot.functionType)
        return slot;
    if (slot.functionType === source) {
        return {
            ...slot,
            resonanceState: ResonanceType.Synchronized,
        };
    }
    const relationship = relationships.find((candidate) => candidate.source === source
        && candidate.target === slot.functionType);
    if (!relationship)
        return slot;
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
function resonanceAmountFor(state) {
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
function exhaustiveRelationshipCheck(value) {
    throw new Error(`Unhandled Function relationship: ${String(value)}`);
}
function exhaustiveResonanceCheck(value) {
    throw new Error(`Unhandled resonance state: ${String(value)}`);
}
