import type { DistrictState, EncounterState } from '../runtime/continuity-state.js';
import { EncounterPhase, EventType } from '../runtime/resonance-types.js';

export enum ContinuityEventKind {
  Ritual = 'Ritual',
  Debate = 'Debate',
  Reconstruction = 'Reconstruction',
  Gathering = 'Gathering',
  Confrontation = 'Confrontation',
}

export enum ContinuityEventStage {
  Dormant = 'Dormant',
  GatheringAttention = 'GatheringAttention',
  PublicPressure = 'PublicPressure',
  ActiveParticipation = 'ActiveParticipation',
  Cascade = 'Cascade',
  MemoryRecording = 'MemoryRecording',
  Resolved = 'Resolved',
}

export interface ContinuityEventOrchestratorInput {
  readonly eventId: string;
  readonly kind: ContinuityEventKind;
  readonly district: DistrictState;
  readonly encounter: EncounterState;
  readonly participantSeekerId?: string;
  readonly witnessCount: number;
  readonly pressureDelta: number;
  readonly stabilizationDelta: number;
}

export interface ContinuityEventOrchestratorResult {
  readonly eventId: string;
  readonly kind: ContinuityEventKind;
  readonly stage: ContinuityEventStage;
  readonly encounterPhase: EncounterPhase;
  readonly districtPressureDelta: number;
  readonly memoryEventType?: EventType;
  readonly shouldCascade: boolean;
  readonly shouldRecordMemory: boolean;
}

export class ContinuityEventOrchestrator {
  public orchestrate(
    input: ContinuityEventOrchestratorInput,
  ): ContinuityEventOrchestratorResult {
    const netPressure = clamp01(
      input.district.pressureLevel + input.pressureDelta - input.stabilizationDelta,
    );

    const stage = stageFor(input, netPressure);

    return {
      eventId: input.eventId,
      kind: input.kind,
      stage,
      encounterPhase: encounterPhaseFor(stage, netPressure),
      districtPressureDelta: netPressure - input.district.pressureLevel,
      memoryEventType: memoryEventFor(stage, input.kind),
      shouldCascade: stage === ContinuityEventStage.Cascade,
      shouldRecordMemory: stage === ContinuityEventStage.MemoryRecording
        || stage === ContinuityEventStage.Resolved,
    };
  }
}

function stageFor(
  input: ContinuityEventOrchestratorInput,
  netPressure: number,
): ContinuityEventStage {
  if (input.encounter.resolved) return ContinuityEventStage.Resolved;

  if (input.participantSeekerId !== undefined && netPressure >= 0.75) {
    return ContinuityEventStage.Cascade;
  }

  if (input.participantSeekerId !== undefined && netPressure >= 0.45) {
    return ContinuityEventStage.ActiveParticipation;
  }

  if (input.witnessCount >= 3 || netPressure >= 0.3) {
    return ContinuityEventStage.PublicPressure;
  }

  if (input.witnessCount > 0) return ContinuityEventStage.GatheringAttention;

  return ContinuityEventStage.Dormant;
}

function encounterPhaseFor(
  stage: ContinuityEventStage,
  netPressure: number,
): EncounterPhase {
  switch (stage) {
    case ContinuityEventStage.Dormant:
      return EncounterPhase.Dormant;
    case ContinuityEventStage.GatheringAttention:
      return EncounterPhase.Entering;
    case ContinuityEventStage.PublicPressure:
    case ContinuityEventStage.ActiveParticipation:
      return netPressure >= 0.55 ? EncounterPhase.Escalating : EncounterPhase.Entering;
    case ContinuityEventStage.Cascade:
      return EncounterPhase.Escalating;
    case ContinuityEventStage.MemoryRecording:
      return EncounterPhase.Stabilizing;
    case ContinuityEventStage.Resolved:
      return EncounterPhase.Resolved;
    default:
      return exhaustiveStageCheck(stage);
  }
}

function memoryEventFor(
  stage: ContinuityEventStage,
  kind: ContinuityEventKind,
): EventType | undefined {
  if (stage !== ContinuityEventStage.MemoryRecording
    && stage !== ContinuityEventStage.Resolved) {
    return undefined;
  }

  switch (kind) {
    case ContinuityEventKind.Ritual:
    case ContinuityEventKind.Debate:
      return EventType.SymbolMeaningShifted;
    case ContinuityEventKind.Reconstruction:
    case ContinuityEventKind.Gathering:
      return EventType.RestorationApplied;
    case ContinuityEventKind.Confrontation:
      return EventType.EncounterResolved;
    default:
      return exhaustiveKindCheck(kind);
  }
}

function clamp01(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

function exhaustiveStageCheck(value: never): never {
  throw new Error(`Unhandled continuity event stage: ${String(value)}`);
}

function exhaustiveKindCheck(value: never): never {
  throw new Error(`Unhandled continuity event kind: ${String(value)}`);
}
