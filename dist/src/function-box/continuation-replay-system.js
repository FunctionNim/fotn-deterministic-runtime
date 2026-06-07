import { ContinuationSequenceSystem } from './continuation-sequence-system.js';
export class ContinuationReplaySystem {
    sequenceSystem = new ContinuationSequenceSystem();
    replay(input) {
        const result = this.sequenceSystem.execute(input);
        return {
            finalSlots: result.slots,
            modifierCount: result.modifiers.length,
            warningCount: result.pressureWarnings.length,
            stateSignature: createStateSignature(result.slots),
        };
    }
}
function createStateSignature(slots) {
    return [...slots]
        .sort((a, b) => a.slotIndex - b.slotIndex)
        .map((slot) => `${slot.slotIndex}:${slot.functionType ?? 'Empty'}:${slot.resonanceState}`)
        .join('|');
}
