import { describe, expect, it } from 'vitest';
import { FunctionBoxRuntime } from '../../src/function-box/function-box-runtime.js';
import { FunctionType, RelationshipType, ResonanceType, } from '../../src/runtime/index.js';
describe('FunctionBoxRuntime', () => {
    it('applies synchronization and opposition resonance states', () => {
        const runtime = new FunctionBoxRuntime();
        const result = runtime.activateSlot({
            activatedSlotIndex: 0,
            slots: [
                {
                    slotIndex: 0,
                    functionType: FunctionType.Green,
                    resonanceState: ResonanceType.Stable,
                    availableAbilityIds: [],
                },
                {
                    slotIndex: 1,
                    functionType: FunctionType.Stone,
                    resonanceState: ResonanceType.Stable,
                    availableAbilityIds: [],
                },
                {
                    slotIndex: 2,
                    functionType: FunctionType.Red,
                    resonanceState: ResonanceType.Stable,
                    availableAbilityIds: [],
                },
            ],
            relationships: [
                {
                    source: FunctionType.Green,
                    target: FunctionType.Stone,
                    relationship: RelationshipType.Feed,
                    influenceStrength: 1,
                    bidirectional: false,
                },
                {
                    source: FunctionType.Green,
                    target: FunctionType.Red,
                    relationship: RelationshipType.Opposition,
                    influenceStrength: 1,
                    bidirectional: false,
                },
            ],
        });
        expect(result.affectedSlots[0].resonanceState)
            .toBe(ResonanceType.Synchronized);
        expect(result.affectedSlots[1].resonanceState)
            .toBe(ResonanceType.Synchronized);
        expect(result.affectedSlots[2].resonanceState)
            .toBe(ResonanceType.Fractured);
    });
});
