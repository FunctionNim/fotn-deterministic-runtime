import { EncounterPhase } from '../runtime/resonance-types.js';
export var EncounterParticipantRole;
(function (EncounterParticipantRole) {
    EncounterParticipantRole["ActiveParticipant"] = "ActiveParticipant";
    EncounterParticipantRole["BondObserver"] = "BondObserver";
    EncounterParticipantRole["Witness"] = "Witness";
})(EncounterParticipantRole || (EncounterParticipantRole = {}));
export class EncounterZoneFlowSystem {
    execute(input) {
        const activeSeekerId = resolveActiveSeekerId(input);
        const observers = input.participants.filter((participant) => participant.seekerId !== activeSeekerId);
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
function resolveActiveSeekerId(input) {
    if (input.encounter.resolved || input.encounter.phase === EncounterPhase.Dormant) {
        return input.requestedActiveSeekerId ?? input.activeSeeker.seekerId;
    }
    return input.activeSeeker.seekerId;
}
function phaseFor(encounter, pressureLevel) {
    if (encounter.resolved)
        return EncounterPhase.Resolved;
    if (pressureLevel >= 0.65)
        return EncounterPhase.Escalating;
    if (pressureLevel >= 0.3)
        return EncounterPhase.Entering;
    return encounter.phase;
}
function clamp01(value) {
    if (Number.isNaN(value))
        return 0;
    return Math.max(0, Math.min(1, value));
}
