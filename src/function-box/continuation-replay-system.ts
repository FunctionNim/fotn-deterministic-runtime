import { ContinuationSequenceSystem } from './continuation-sequence-system.js';
import type { FunctionRelationship, FunctionSlot } from '../runtime/continuity-state.js';

export interface ContinuationReplayInput {
  readonly slots: FunctionSlot[];
  readonly relationships: FunctionRelationship[];
}

export interface ContinuationReplayResult {
  readonly finalSlots: FunctionSlot[];
  readonly modifierCount: number;
  readonly warningCount: number;
  readonly stateSignature: string;
}

export class ContinuationReplaySystem {
  private readonly sequenceSystem = new ContinuationSequenceSystem();

  public replay(input: ContinuationReplayInput): ContinuationReplayResult {
    const result = this.sequenceSystem.execute(input);

    return {
      finalSlots: result.slots,
      modifierCount: result.modifiers.length,
      warningCount: result.pressureWarnings.length,
      stateSignature: createStateSignature(result.slots),
    };
  }
}

function createStateSignature(slots: FunctionSlot[]): string {
  return [...slots]
    .sort((a, b) => a.slotIndex - b.slotIndex)
    .map((slot) => `${slot.slotIndex}:${slot.functionType ?? 'Empty'}:${slot.resonanceState}`)
    .join('|');
}
