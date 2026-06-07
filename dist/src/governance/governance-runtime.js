import { clamp01 } from '../runtime/continuity-state.js';
import { EventType, ResonanceType } from '../runtime/resonance-types.js';
export var GovernanceDecisionType;
(function (GovernanceDecisionType) {
    GovernanceDecisionType["RestorationPriority"] = "RestorationPriority";
    GovernanceDecisionType["SymbolicLaw"] = "SymbolicLaw";
    GovernanceDecisionType["EmergencyStabilization"] = "EmergencyStabilization";
})(GovernanceDecisionType || (GovernanceDecisionType = {}));
export class GovernanceRuntime {
    evaluateDistrictPriority(district) {
        return {
            districtId: district.districtId,
            restorationUrgency: clamp01(1 - district.restorationProgress),
            pressureUrgency: district.pressureLevel,
            memoryFragility: district.memoryPressure,
            symbolicImportance: clamp01((district.memoryPressure + district.resonanceStability) / 2),
        };
    }
    createDecision(signal, generatedAtTick) {
        const urgency = clamp01(signal.pressureUrgency * 0.45
            + signal.restorationUrgency * 0.3
            + signal.memoryFragility * 0.15
            + signal.symbolicImportance * 0.1);
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
    decisionToEvent(decision) {
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
