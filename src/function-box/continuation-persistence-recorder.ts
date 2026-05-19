import type { ContinuationSequenceResult } from './continuation-sequence-system.js';
import type { WorldMemoryRecord } from '../runtime/continuity-event.js';
import { EventType, ResonanceType } from '../runtime/resonance-types.js';

export interface ContinuationPersistenceInput {
  readonly sequenceId: string;
  readonly districtId: string;
  readonly generatedAtTick: number;
  readonly result: ContinuationSequenceResult;
}

export class ContinuationPersistenceRecorder {
  public record(input: ContinuationPersistenceInput): WorldMemoryRecord[] {
    const records: WorldMemoryRecord[] = [];

    if (input.result.modifiers.length > 0) {
      records.push({
        recordId: `sequence:${input.sequenceId}:flow:${input.generatedAtTick}`,
        type: EventType.FunctionRelationshipChanged,
        historicalWeight: clamp01(input.result.modifiers.length / 10),
        influencedDistricts: [input.districtId],
        emotionalResonance: {
          emotionalWeight: clamp01(input.result.modifiers.length / 10),
          resonanceType: ResonanceType.Synchronized,
        },
      });
    }

    if (input.result.pressureWarnings.length > 0) {
      records.push({
        recordId: `sequence:${input.sequenceId}:fracture:${input.generatedAtTick}`,
        type: EventType.PressureShift,
        historicalWeight: clamp01(input.result.pressureWarnings.length / 5),
        influencedDistricts: [input.districtId],
        emotionalResonance: {
          emotionalWeight: clamp01(input.result.pressureWarnings.length / 5),
          resonanceType: ResonanceType.Fractured,
        },
      });
    }

    return records;
  }
}

function clamp01(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(1, value));
}
