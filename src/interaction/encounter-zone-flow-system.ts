import type { EncounterState, SeekerState } from '../runtime/continuity-state.js';
import { EncounterPhase } from '../runtime/resonance-types.js';

export enum EncounterParticipantRole {
  ActiveParticipant = 'ActiveParticipant',
  BondObserver = 'BondObserver',
  Witness = 'Witness',
}

export interface EncounterParticipant {
  readonly seekerId: string;
  readonly role: EncounterParticipantRole;
  readonly bondStrength: number;
  readonly observing: boolean;
}

export interface EncounterZoneFlowInput {
  readonly encounter: EncounterState;
  readonly activeSeeker: SeekerState;
  readonly participants: EncounterParticipant[];
  readonly requestedActiveSeekerId?: string;
  readonly pressureLevel: number;
}

export interface EncounterZoneFlowResult {
  readonly activeSeekerId: string;
  readonly observers: EncounterParticipant[];
  readonly bondAssistStrength: number;
  readonly witnessCount: number;
  readonly encounterPhase: EncounterPhase;
  readonly canAcceptNewActiveParticipant: boolean;
}

export class EncounterZoneFlowSystem {
  public execute(input: EncounterZoneFlowInput): EncounterZoneFlowResult {
    const activeSeekerId = resolveActiveSeekerId(input);
    const observers = input.participants.filter(
      (participant) => participant.seekerId !== activeSeekerId,
    );

    const bondAssistStrength = observers
      .filter((participant) => participant.role === EncounterParticipantRole.BondObserver)
      .reduce((total, participant) => total + participant.bondStrength, 0);

    return {
      activeSeekerId,
      observers,
      bondAssistStrength: clamp01(bondAssistStrength),
      witnessCount: observers.filter((participant) => participant.observing).length,
      encounterPhase: phaseFor(input.encounter, input.pressureLevel),
      canAcceptNewActiveParticipant: input.encounter.resolved
        || input.encounter.phase === EncounterPhase.Dormant,
    };
  }
}

function resolveActiveSeekerId(input: EncounterZoneFlowInput): string {
  if (input.encounter.resolved || input.encounter.phase === EncounterPhase.Dormant) {
    return input.requestedActiveSeekerId ?? input.activeSeeker.seekerId;
  }

  return input.activeSeeker.seekerId;
}

function phaseFor(
  encounter: EncounterState,
  pressureLevel: number,
): EncounterPhase {
  if (encounter.resolved) return EncounterPhase.Resolved;
  if (pressureLevel >= 0.65) return EncounterPhase.Escalating;
  if (pressureLevel >= 0.3) return EncounterPhase.Entering;
  return encounter.phase;
}

function clamp01(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(1, value));
}
