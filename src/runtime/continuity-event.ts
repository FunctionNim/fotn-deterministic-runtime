import { EventType, ResonanceType } from './resonance-types.js';

export interface EmotionalResonance {
  emotionalWeight: number;
  resonanceType: ResonanceType;
}

export interface ContinuityEvent {
  eventId: string;
  type: EventType;
  resonance: ResonanceType;
  emotionalWeight: number;
  propagationStrength: number;
  affectedDistricts: string[];
  generatedAtTick: number;
}

export interface WorldMemoryRecord {
  recordId: string;
  type: EventType;
  historicalWeight: number;
  influencedDistricts: string[];
  emotionalResonance: EmotionalResonance;
}

export function shouldPersistEvent(event: ContinuityEvent): boolean {
  return event.emotionalWeight >= 0.6 || event.propagationStrength >= 0.7;
}
