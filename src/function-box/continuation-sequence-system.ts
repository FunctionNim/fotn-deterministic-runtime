import { FunctionBoxRuntime } from './function-box-runtime.js';
import type {
  FunctionRelationship,
  FunctionSlot,
  ResonanceModifier,
} from '../runtime/continuity-state.js';
import { ResonanceType } from '../runtime/resonance-types.js';

export interface ContinuationSequenceInput {
  readonly slots: FunctionSlot[];
  readonly relationships: FunctionRelationship[];
}

export interface ContinuationSequenceResult {
  readonly slots: FunctionSlot[];
  readonly modifiers: ResonanceModifier[];
  readonly pressureWarnings: string[];
}

export class ContinuationSequenceSystem {
  private readonly functionBoxRuntime = new FunctionBoxRuntime();

  public execute(input: ContinuationSequenceInput): ContinuationSequenceResult {
    let currentSlots = [...input.slots];
    const modifiers: ResonanceModifier[] = [];
    const pressureWarnings: string[] = [];

    const orderedSlots = [...currentSlots]
      .filter((slot) => slot.functionType !== undefined)
      .sort((a, b) => a.slotIndex - b.slotIndex);

    for (const slot of orderedSlots) {
      const result = this.functionBoxRuntime.activateSlot({
        slots: currentSlots,
        relationships: input.relationships,
        activatedSlotIndex: slot.slotIndex,
      });

      currentSlots = mergeSlotStates(currentSlots, result.affectedSlots);
      modifiers.push(...result.resonanceModifiers);
    }

    const fracturedCount = currentSlots
      .filter((slot) => slot.resonanceState === ResonanceType.Fractured)
      .length;

    if (fracturedCount > 0) {
      pressureWarnings.push(
        `${fracturedCount} fractured continuation slot(s) require stabilization.`,
      );
    }

    return {
      slots: currentSlots,
      modifiers,
      pressureWarnings,
    };
  }
}

function mergeSlotStates(
  baseSlots: FunctionSlot[],
  updatedSlots: FunctionSlot[],
): FunctionSlot[] {
  return baseSlots.map((slot) => {
    const updated = updatedSlots.find(
      (candidate) => candidate.slotIndex === slot.slotIndex,
    );

    return updated ?? slot;
  });
}
