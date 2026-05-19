import { EncounterPhase, EmotionalTrend, FunctionType, RelationshipType, ResonanceType } from './resonance-types.js';

export interface ResonanceState {
  stability: number;
  synchronization: number;
  distortion: number;
  emotionalIntensity: number;
  primaryType: ResonanceType;
  activeModifiers: ResonanceModifier[];
}

export interface ResonanceModifier {
  id: string;
  source: string;
  amount: number;
  expiresAtTick?: number;
}

export interface EmotionalState {
  calm: number;
  fear: number;
  hope: number;
  curiosity: number;
  isolation: number;
  connection: number;
  currentTrend: EmotionalTrend;
}

export interface SynchronizationState {
  level: number;
  linkedContinuities: string[];
  isOverloaded: boolean;
}

export interface RestorationState {
  emotionalRecovery: number;
  resonanceRecovery: number;
  inTeaRitual: boolean;
  inCommunalCraft: boolean;
  synchronizationBoost: number;
}

export interface IdentityState {
  pathId?: string;
  districtAffinities: Record<string, number>;
  symbolicMarks: string[];
}

export interface FunctionSlot {
  slotIndex: number;
  functionType?: FunctionType;
  resonanceState: ResonanceType;
  availableAbilityIds: string[];
}

export interface FunctionRelationship {
  source: FunctionType;
  target: FunctionType;
  relationship: RelationshipType;
  influenceStrength: number;
  bidirectional: boolean;
}

export interface MemoryInfluence {
  memoryId: string;
  type: string;
  influenceStrength: number;
  sharedCollectively: boolean;
  distorted: boolean;
}

export interface SeekerState {
  seekerId: string;
  resonance: ResonanceState;
  emotional: EmotionalState;
  synchronization: SynchronizationState;
  restoration: RestorationState;
  functionBox: FunctionSlot[];
  functionRelationships: FunctionRelationship[];
  activeMemories: MemoryInfluence[];
  pressureLevel: number;
  exhaustionLevel: number;
  identity: IdentityState;
}

export interface DistrictState {
  districtId: string;
  pressureLevel: number;
  emotionalClimate: EmotionalState;
  restorationProgress: number;
  memoryPressure: number;
  migrationPressure: number;
  environmentStability: number;
  resonanceStability: number;
}

export interface EncounterState {
  encounterId: string;
  phase: EncounterPhase;
  pressureLevel: number;
  resonance: ResonanceState;
  activeEffectIds: string[];
  resolved: boolean;
}

export interface ContinuityRuntimeState {
  tick: number;
  seekers: Record<string, SeekerState>;
  districts: Record<string, DistrictState>;
  encounters: Record<string, EncounterState>;
}

export function clamp01(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(1, value));
}
