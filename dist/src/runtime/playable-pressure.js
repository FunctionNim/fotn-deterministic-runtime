import { FunctionType } from './resonance-types.js';
export function createAnchorPulseSpellSeed() {
    return {
        spellSeedId: 'spell-seed:stone:anchor-pulse',
        name: 'Anchor Pulse',
        functionType: FunctionType.Stone,
        status: 'PracticeReady',
        planes: ['Material', 'Spatial', 'RealityAdjacent'],
        operation: 'Boundary / Hold / Stabilize',
        carriers: ['Room Anchor', 'Hand Sigil', 'Floor Stone', 'Breath Count', 'Witnessed Release Phrase'],
        medicine: 'Creates temporary stability, prevents panic-collapse, and gives pressure a return reference.',
        poison: 'Over-stability, refusal to move, dead law, and shelter becoming tomb.',
        containmentRule: 'A release condition must be named before the hold becomes complete.',
        misuseRisk: 'Burial Law Unit',
        safetyBoundary: 'No Stone effect may seal living continuity without a named exit, witness, or release.',
        requiredWitnessType: 'Anchor Witness or Return Witness',
        returnOutput: 'Living Stability / Stability with Release',
    };
}
export function createStoneToClayTrialGate() {
    return {
        gateId: 'trial-gate:stone-to-clay',
        fromFunction: FunctionType.Stone,
        toFunction: FunctionType.Clay,
        question: 'Can the learner release a held pressure without breaking it?',
        passCondition: 'Stabilize the room, name what was protected, release the anchor, and carry the lesson forward.',
        reversionWarning: 'Burial',
        returnOutput: 'Living Stability / Stability with Release',
    };
}
export function createRoomThatWouldNotFall() {
    return {
        roomId: 'room:stone:that-would-not-fall',
        name: 'The Room That Would Not Fall',
        functionType: FunctionType.Stone,
        spellSeedId: 'spell-seed:stone:anchor-pulse',
        teachingQuestion: 'What must remain stable, and when must stability let go?',
        phase: 'Dormant',
        pressureMeter: {
            tremor: 1,
            seal: 0,
            passage: 0,
        },
        anchorPlates: [
            createAnchorPlate('plate:first'),
            createAnchorPlate('plate:second'),
            createAnchorPlate('plate:threshold'),
        ],
        witnessRecords: [],
    };
}
export function applyStoneRoomAction(room, action) {
    if (room.phase === 'Resolved' || room.phase === 'Failed')
        return room;
    switch (action.type) {
        case 'EnterRoom':
            return {
                ...room,
                phase: 'Entered',
                witnessRecords: appendRecord(room, 'Entered trembling Stone tutorial room.'),
            };
        case 'TestAnchor':
            return updatePlate(room, action.plateId, (plate) => ({
                ...plate,
                discovered: true,
            }), 'Reading', `Tested ${action.plateId}.`);
        case 'NameProtection':
            return updatePlate(room, action.plateId, (plate) => ({
                ...plate,
                protectionName: action.protectionName,
            }), 'Reading', `Named protection for ${action.plateId}: ${action.protectionName}.`);
        case 'NameReleaseCondition':
            return updatePlate(room, action.plateId, (plate) => ({
                ...plate,
                releaseCondition: action.releaseCondition,
            }), 'Reading', `Named release for ${action.plateId}: ${action.releaseCondition}.`);
        case 'CastAnchorPulse':
            return castAnchorPulse(room, action.plateId);
        case 'ReleaseAnchor':
            return releaseAnchor(room, action.plateId);
        case 'ForceBreak':
            return failRoom(room, 'ForceBreak', `Force broke ${action.plateId}; conflict replaced understanding.`);
        case 'RecordLedger':
            return recordLedger(room);
        default:
            return exhaustiveActionCheck(action);
    }
}
function createAnchorPlate(plateId) {
    return {
        plateId,
        protectionName: null,
        releaseCondition: null,
        discovered: false,
        stabilized: false,
        released: false,
    };
}
function castAnchorPulse(room, plateId) {
    const plate = findPlate(room, plateId);
    if (!plate?.discovered)
        return failRoom(room, 'NoAnchor', `Tried to cast before discovering ${plateId}.`);
    if (!plate.protectionName)
        return failRoom(room, 'PanicHold', `Tried to stabilize ${plateId} without naming what it protects.`);
    if (!plate.releaseCondition)
        return failRoom(room, 'NoReleaseCondition', `Tried to stabilize ${plateId} without naming a release condition.`);
    return updatePlate({
        ...room,
        pressureMeter: {
            tremor: clamp01(room.pressureMeter.tremor - 0.25),
            seal: clamp01(room.pressureMeter.seal + 0.05),
            passage: clamp01(room.pressureMeter.passage + 0.2),
        },
    }, plateId, (target) => ({
        ...target,
        stabilized: true,
    }), 'Casting', `Cast Anchor Pulse on ${plateId}.`);
}
function releaseAnchor(room, plateId) {
    const plate = findPlate(room, plateId);
    if (!plate?.stabilized)
        return room;
    const releasedRoom = updatePlate({
        ...room,
        pressureMeter: {
            tremor: clamp01(room.pressureMeter.tremor + 0.05),
            seal: clamp01(room.pressureMeter.seal - 0.15),
            passage: clamp01(room.pressureMeter.passage + 0.15),
        },
    }, plateId, (target) => ({
        ...target,
        released: true,
    }), 'Releasing', `Released ${plateId} after stability became useful.`);
    return isRoomReadyToResolve(releasedRoom)
        ? {
            ...releasedRoom,
            phase: 'Resolved',
            returnOutput: 'Living Stability / Stability with Release',
            witnessRecords: appendRecord(releasedRoom, 'Room resolved: stability protected return without becoming tomb.'),
        }
        : releasedRoom;
}
function recordLedger(room) {
    if (room.phase !== 'Resolved')
        return room;
    const ledgerEntry = {
        entryId: 'ledger:room:stone:that-would-not-fall',
        roomId: room.roomId,
        functionTested: room.functionType,
        spellSeedId: room.spellSeedId,
        held: ['trembling room', 'anchor plates', 'exit threshold'],
        protected: room.anchorPlates.map((plate) => plate.protectionName ?? 'unnamed protection').sort(),
        almostBecamePrison: room.pressureMeter.seal > 0.5 ? ['over-sealed threshold'] : [],
        releaseConditionsNamed: room.anchorPlates.map((plate) => plate.releaseCondition ?? 'unnamed release').sort(),
        witnessConfirmation: 'Anchor Witness confirmed release before shelter became tomb.',
        costPaid: 'Body Cost: breath strain, hand tremor, shoulder weight.',
        reversionWarning: 'Burial',
        returnOutput: room.returnOutput ?? 'Living Stability / Stability with Release',
        awaitingCollection: ['Clay follow-up room', 'Stone-to-Clay transition lesson'],
    };
    return {
        ...room,
        ledgerEntry,
        witnessRecords: appendRecord(room, 'Continuity Ledger recorded Stone return output.'),
    };
}
function updatePlate(room, plateId, updater, phase, witnessRecord) {
    return {
        ...room,
        phase,
        anchorPlates: room.anchorPlates.map((plate) => (plate.plateId === plateId ? updater(plate) : plate)),
        witnessRecords: appendRecord(room, witnessRecord),
    };
}
function failRoom(room, failureState, witnessRecord) {
    return {
        ...room,
        phase: 'Failed',
        failureState,
        pressureMeter: {
            tremor: clamp01(room.pressureMeter.tremor),
            seal: 1,
            passage: 0,
        },
        witnessRecords: appendRecord(room, witnessRecord),
    };
}
function findPlate(room, plateId) {
    return room.anchorPlates.find((plate) => plate.plateId === plateId);
}
function isRoomReadyToResolve(room) {
    return room.anchorPlates.every((plate) => plate.discovered && plate.protectionName && plate.releaseCondition && plate.stabilized && plate.released)
        && room.pressureMeter.passage >= 0.9
        && room.pressureMeter.seal < 0.5;
}
function appendRecord(room, record) {
    return [...room.witnessRecords, record].sort();
}
function clamp01(value) {
    if (Number.isNaN(value))
        return 0;
    return Math.max(0, Math.min(1, Number(value.toFixed(4))));
}
function exhaustiveActionCheck(action) {
    throw new Error(`Unhandled Stone room action: ${String(action)}`);
}
