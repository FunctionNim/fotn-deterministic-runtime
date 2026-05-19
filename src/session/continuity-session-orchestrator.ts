import type { DistrictState, EncounterState, SeekerState } from '../runtime/continuity-state.js';
import { ContinuityInteractionIntent, ContinuityInteractionState, ContinuityInteractionSystem } from '../interaction/continuity-interaction-system.js';
import { EncounterParticipant, EncounterZoneFlowSystem } from '../interaction/encounter-zone-flow-system.js';
import { MentalismPerceptionSystem } from '../interaction/mentalism-perception-system.js';
import { ContinuityEventKind, ContinuityEventOrchestrator } from '../events/continuity-event-orchestrator.js';
import { ContinuityMemoryEngine } from '../memory/continuity-memory-engine.js';
import { SymbolEvolutionState, SymbolEvolutionSystem, SymbolPressureSource } from '../symbols/symbol-evolution-system.js';
import { DistrictFlowKind, DistrictFlowSystem } from '../district/district-flow-system.js';
import { ContinuityRecoverySystem, RecoveryActivity } from '../recovery/continuity-recovery-system.js';
import { EventType } from '../runtime/resonance-types.js';

export interface ContinuitySessionInput {
  readonly sessionId: string;
  readonly seeker: SeekerState;
  readonly district: DistrictState;
  readonly encounter: EncounterState;
  readonly participants: EncounterParticipant[];
  readonly interactionState: ContinuityInteractionState;
  readonly intent: ContinuityInteractionIntent;
  readonly eventKind: ContinuityEventKind;
  readonly flowKind: DistrictFlowKind;
  readonly withinInteractionRange: boolean;
  readonly pressureChange: number;
  readonly stabilizationDelta: number;
  readonly baseMentalism: number;
  readonly meditationAlignment: number;
  readonly recoveryActivity?: RecoveryActivity;
  readonly witnessedReturnCount: number;
}

export interface ContinuitySessionResult {
  readonly sessionId: string;
  readonly activeSeekerId: string;
  readonly interactionState: ContinuityInteractionState;
  readonly pressureDelta: number;
  readonly exhaustionDelta: number;
  readonly mentalismTier: string;
  readonly visibleLayerCount: number;
  readonly eventStage: string;
  readonly memoryStage: string;
  readonly symbolState: SymbolEvolutionState;
  readonly districtRhythm: string;
  readonly canReturnToEncounter: boolean;
  readonly worldContinues: boolean;
}

export class ContinuitySessionOrchestrator {
  private readonly interactionSystem = new ContinuityInteractionSystem();
  private readonly encounterFlowSystem = new EncounterZoneFlowSystem();
  private readonly mentalismSystem = new MentalismPerceptionSystem();
  private readonly eventOrchestrator = new ContinuityEventOrchestrator();
  private readonly memoryEngine = new ContinuityMemoryEngine();
  private readonly symbolSystem = new SymbolEvolutionSystem();
  private readonly districtFlowSystem = new DistrictFlowSystem();
  private readonly recoverySystem = new ContinuityRecoverySystem();

  public run(input: ContinuitySessionInput): ContinuitySessionResult {
    const encounterFlow = this.encounterFlowSystem.execute({
      encounter: input.encounter,
      activeSeeker: input.seeker,
      participants: input.participants,
      requestedActiveSeekerId: input.seeker.seekerId,
      pressureLevel: input.encounter.pressureLevel,
    });

    const interaction = this.interactionSystem.execute({
      seeker: input.seeker,
      encounter: input.encounter,
      currentState: input.interactionState,
      intent: input.intent,
      withinInteractionRange: input.withinInteractionRange,
      pressureChange: input.pressureChange,
      bondAssistStrength: encounterFlow.bondAssistStrength,
    });

    const perception = this.mentalismSystem.evaluate({
      seeker: input.seeker,
      baseMentalism: input.baseMentalism,
      meditationAlignment: input.meditationAlignment,
    });

    const event = this.eventOrchestrator.orchestrate({
      eventId: input.sessionId,
      kind: input.eventKind,
      district: input.district,
      encounter: input.encounter,
      participantSeekerId: encounterFlow.activeSeekerId,
      witnessCount: encounterFlow.witnessCount,
      pressureDelta: interaction.pressureDelta,
      stabilizationDelta: input.stabilizationDelta,
    });

    const memory = this.memoryEngine.preserve({
      memoryId: `session:${input.sessionId}:memory`,
      sourceEventType: event.memoryEventType ?? EventType.EncounterEntered,
      districtId: input.district.districtId,
      witnessCount: encounterFlow.witnessCount,
      pressureWeight: Math.max(0, event.districtPressureDelta),
      restorationWeight: input.stabilizationDelta,
      priorInfluences: input.seeker.activeMemories,
    });

    const symbol = this.symbolSystem.evolve({
      symbolId: `session:${input.sessionId}:symbol`,
      districtId: input.district.districtId,
      currentState: SymbolEvolutionState.StableMark,
      pressureSource: pressureSourceFor(input.eventKind),
      eventType: event.memoryEventType ?? EventType.EncounterEntered,
      publicAlignment: Math.min(1, encounterFlow.witnessCount / 10),
      contradictionPressure: memory.contradictionPressure,
      restorationInfluence: input.stabilizationDelta,
      historicalWeight: memory.memoryRecord.historicalWeight,
    });

    const districtFlow = this.districtFlowSystem.circulate({
      district: input.district,
      flowKind: input.flowKind,
      routeStability: input.district.environmentStability,
      publicPressure: input.district.pressureLevel + Math.max(0, event.districtPressureDelta),
      restorationActivity: input.stabilizationDelta,
      memoryTraffic: memory.memoryRecord.historicalWeight,
    });

    const recovery = this.recoverySystem.recover({
      seeker: input.seeker,
      activity: input.recoveryActivity ?? RecoveryActivity.ObserveQuietly,
      meditationFocus: input.meditationAlignment,
      witnessedReturnCount: input.witnessedReturnCount,
    });

    return {
      sessionId: input.sessionId,
      activeSeekerId: encounterFlow.activeSeekerId,
      interactionState: interaction.nextState,
      pressureDelta: interaction.pressureDelta,
      exhaustionDelta: interaction.exhaustionDelta,
      mentalismTier: perception.tier,
      visibleLayerCount: perception.visibleLayers.length,
      eventStage: event.stage,
      memoryStage: memory.stage,
      symbolState: symbol.nextState,
      districtRhythm: districtFlow.rhythmState,
      canReturnToEncounter: recovery.canReturnToEncounter,
      worldContinues: interaction.worldShouldContinue,
    };
  }
}

function pressureSourceFor(kind: ContinuityEventKind): SymbolPressureSource {
  switch (kind) {
    case ContinuityEventKind.Ritual:
      return SymbolPressureSource.Ritual;
    case ContinuityEventKind.Debate:
      return SymbolPressureSource.Debate;
    case ContinuityEventKind.Reconstruction:
    case ContinuityEventKind.Gathering:
      return SymbolPressureSource.Reconstruction;
    case ContinuityEventKind.Confrontation:
      return SymbolPressureSource.Confrontation;
    default:
      return exhaustiveKindCheck(kind);
  }
}

function exhaustiveKindCheck(value: never): never {
  throw new Error(`Unhandled continuity event kind: ${String(value)}`);
}
