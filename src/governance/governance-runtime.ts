import type { ContinuityEvent } from '../runtime/continuity-event.js';
import { clamp01, DistrictState } from '../runtime/continuity-state.js';
import { EventType, ResonanceType } from '../runtime/resonance-types.js';

export enum GovernanceDecisionType {
  RestorationPriority = 'RestorationPriority',
  SymbolicLaw = 'SymbolicLaw',
  EmergencyStabilization = 'EmergencyStabilization',
}

export interface DistrictPrioritySignal {
  readonly districtId: string;
  readonly restorationUrgency: number;
  readonly pressureUrgency: number;
  readonly memoryFragility: number;
  readonly symbolicImportance: number;
}

export interface GovernanceDecision {
  readonly decisionId: string;
  readonly type: GovernanceDecisionType;
  readonly targetDistrictId: string;
  readonly resonanceAlignment: number;
  readonly urgency: number;
  readonly generatedAtTick: number;
}

export class GovernanceRuntime {
  public evaluateDistrictPriority(district: DistrictState): DistrictPrioritySignal {
    return {
      districtId: district.districtId,
      restorationUrgency: clamp01(1 - district.restorationProgress),
      pressureUrgency: district.pressureLevel,
      memoryFragility: district.memoryPressure,
      symbolicImportance: clamp01((district.memoryPressure + district.resonanceStability) / 2),
    };
  }

  public createDecision(signal: DistrictPrioritySignal, generatedAtTick: number): GovernanceDecision {
    const urgency = clamp01(
      signal.pressureUrgency * 0.45
        + signal.restorationUrgency * 0.3
        + signal.memoryFragility * 0.15
        + signal.symbolicImportance * 0.1,
    );

    return {
      decisionId: `governance:${signal.districtId}:${generatedAtTick}`,
      type: urgency >= 0.75
        ? GovernanceDecisionType.EmergencyStabilization
        : GovernanceDecisionType.RestorationPriority,
      targetDistrictId: signal.districtId,
      resonanceAlignment: clamp01(1 - Math.abs(signal.pressureUrgency - signal.restorationUrgency)),
      urgency,
      generatedAtTick,
    };
  }

  public decisionToEvent(decision: GovernanceDecision): ContinuityEvent {
    return {
      eventId: `decision:${decision.decisionId}`,
      type: decision.type === GovernanceDecisionType.EmergencyStabilization
        ? EventType.PressureShift
        : EventType.RestorationApplied,
      resonance: decision.type === GovernanceDecisionType.EmergencyStabilization
        ? ResonanceType.Pressured
        : ResonanceType.Restoring,
      emotionalWeight: decision.resonanceAlignment,
      propagationStrength: decision.urgency,
      affectedDistricts: [decision.targetDistrictId],
      generatedAtTick: decision.generatedAtTick,
    };
  }
}
