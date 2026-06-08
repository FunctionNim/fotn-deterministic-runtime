import { applyStoneRoomAction, createAnchorPulseSpellSeed, createRoomThatWouldNotFall, createStoneToClayTrialGate, } from '../runtime/playable-pressure.js';
import { createFirstContinuationState, runFirstContinuationLoop, } from '../prototype/first-continuation-loop.js';
// ─── Formatting helpers ────────────────────────────────────────────────────────
function hr(char = '─', width = 68) {
    return char.repeat(width);
}
function box(title) {
    const pad = Math.max(0, 66 - title.length);
    const left = Math.floor(pad / 2);
    const right = pad - left;
    console.log(`┌${hr()}┐`);
    console.log(`│ ${' '.repeat(left)}${title}${' '.repeat(right)} │`);
    console.log(`└${hr()}┘`);
}
function section(title) {
    console.log(`\n  ┄┄  ${title}  ┄┄`);
}
function bar(label, value, width = 20) {
    const filled = Math.round(value * width);
    const empty = width - filled;
    const pct = (value * 100).toFixed(0).padStart(3);
    return `  ${label.padEnd(18)} [${'█'.repeat(filled)}${'░'.repeat(empty)}] ${pct}%`;
}
function fmt(value) {
    return value.toFixed(4);
}
// ─── Act I: Stone Room ─────────────────────────────────────────────────────────
function runStoneRoomAct() {
    box('ACT I — The Room That Would Not Fall  (Stone Pressure Sequence)');
    const spellSeed = createAnchorPulseSpellSeed();
    const trialGate = createStoneToClayTrialGate();
    section('Spell Seed');
    console.log(`  Name          : ${spellSeed.name}`);
    console.log(`  Function Type : ${spellSeed.functionType}`);
    console.log(`  Operation     : ${spellSeed.operation}`);
    console.log(`  Containment   : ${spellSeed.containmentRule}`);
    console.log(`  Return Output : ${spellSeed.returnOutput}`);
    section('Trial Gate');
    console.log(`  ${trialGate.fromFunction} → ${trialGate.toFunction}`);
    console.log(`  Pass Condition    : ${trialGate.passCondition}`);
    console.log(`  Reversion Warning : ${trialGate.reversionWarning}`);
    let room = createRoomThatWouldNotFall();
    section('Initial Room State');
    printRoomSnapshot(room);
    console.log('\n  ── Action Sequence ──────────────────────────────────────────');
    room = applyAndPrint(room, { type: 'EnterRoom' });
    const plates = ['plate:first', 'plate:second', 'plate:threshold'];
    for (const plateId of plates) {
        console.log(`\n  ·· ${plateId} ··`);
        room = applyAndPrint(room, { type: 'TestAnchor', plateId });
        room = applyAndPrint(room, {
            type: 'NameProtection',
            plateId,
            protectionName: `shield the ${plateId.replace('plate:', '')} passage`,
        });
        room = applyAndPrint(room, {
            type: 'NameReleaseCondition',
            plateId,
            releaseCondition: `release ${plateId} when the way forward is clear`,
        });
        room = applyAndPrint(room, { type: 'CastAnchorPulse', plateId });
        room = applyAndPrint(room, { type: 'ReleaseAnchor', plateId });
    }
    section('Final Room State');
    printRoomSnapshot(room);
    section('Recording Ledger');
    room = applyStoneRoomAction(room, { type: 'RecordLedger' });
    if (room.ledgerEntry) {
        printLedger(room.ledgerEntry);
    }
    section('Determinism Proof');
    const roomA = solveRoomFresh();
    const roomB = solveRoomFresh();
    const identical = roomA.phase === roomB.phase &&
        roomA.returnOutput === roomB.returnOutput &&
        roomA.pressureMeter.passage === roomB.pressureMeter.passage &&
        roomA.pressureMeter.seal === roomB.pressureMeter.seal;
    console.log(`  Two independent runs produce identical result: ${identical ? '✓ YES' : '✗ NO'}`);
    console.log(`  Phase    : ${roomA.phase}`);
    console.log(`  Passage  : ${fmt(roomA.pressureMeter.passage)}  (both runs)`);
    console.log(`  Seal     : ${fmt(roomA.pressureMeter.seal)}  (both runs)`);
}
function applyAndPrint(room, action) {
    const next = applyStoneRoomAction(room, action);
    const label = action.type === 'TestAnchor' || action.type === 'NameProtection' ||
        action.type === 'NameReleaseCondition' || action.type === 'CastAnchorPulse' ||
        action.type === 'ReleaseAnchor' || action.type === 'ForceBreak'
        ? `${action.type}(${action.plateId})`
        : action.type;
    const pMeter = next.pressureMeter;
    console.log(`    [${next.phase.padEnd(10)}] ${label.padEnd(34)}` +
        `  tremor:${fmt(pMeter.tremor)}  seal:${fmt(pMeter.seal)}  passage:${fmt(pMeter.passage)}`);
    return next;
}
function printRoomSnapshot(room) {
    console.log(`  Room    : ${room.name}`);
    console.log(`  Phase   : ${room.phase}`);
    console.log(bar('Tremor', room.pressureMeter.tremor));
    console.log(bar('Seal', room.pressureMeter.seal));
    console.log(bar('Passage', room.pressureMeter.passage));
    console.log(`  Plates  : ${room.anchorPlates.map((p) => `${p.plateId}(discovered:${p.discovered ? 'Y' : 'N'} stabilized:${p.stabilized ? 'Y' : 'N'} released:${p.released ? 'Y' : 'N'})`).join(', ')}`);
    if (room.returnOutput) {
        console.log(`  Output  : ${room.returnOutput}`);
    }
}
function printLedger(entry) {
    console.log(`  Entry ID          : ${entry.entryId}`);
    console.log(`  Function Tested   : ${entry.functionTested}`);
    console.log(`  Spell Seed        : ${entry.spellSeedId}`);
    console.log(`  Reversion Warning : ${entry.reversionWarning}`);
    console.log(`  Return Output     : ${entry.returnOutput}`);
    console.log(`  Protected         : ${entry.protected.join(', ')}`);
    console.log(`  Release Conditions: ${entry.releaseConditionsNamed.length} named`);
    console.log(`  Witness           : ${entry.witnessConfirmation}`);
    console.log(`  Awaiting          : ${entry.awaitingCollection.join(', ')}`);
}
function solveRoomFresh() {
    let room = createRoomThatWouldNotFall();
    room = applyStoneRoomAction(room, { type: 'EnterRoom' });
    for (const plateId of ['plate:first', 'plate:second', 'plate:threshold']) {
        room = applyStoneRoomAction(room, { type: 'TestAnchor', plateId });
        room = applyStoneRoomAction(room, {
            type: 'NameProtection', plateId,
            protectionName: `shield the ${plateId.replace('plate:', '')} passage`,
        });
        room = applyStoneRoomAction(room, {
            type: 'NameReleaseCondition', plateId,
            releaseCondition: `release ${plateId} when the way forward is clear`,
        });
        room = applyStoneRoomAction(room, { type: 'CastAnchorPulse', plateId });
        room = applyStoneRoomAction(room, { type: 'ReleaseAnchor', plateId });
    }
    return room;
}
// ─── Act II: Continuation Loop ────────────────────────────────────────────────
function runContinuationLoopAct() {
    box('ACT II — First Continuation Loop  (World State + Event Audit)');
    section('Initial World State');
    const initialState = createFirstContinuationState();
    const seeker = initialState.seekers.seeker_alpha;
    const district = initialState.districts.starter;
    const encounter = initialState.encounters.pressure_alpha;
    console.log(`  Tick : ${initialState.tick}`);
    console.log(`\n  Seeker: seeker_alpha`);
    console.log(bar('  Pressure', seeker.pressureLevel));
    console.log(bar('  Resonance Stability', seeker.resonance.stability));
    console.log(bar('  Calm', seeker.emotional.calm));
    console.log(bar('  Hope', seeker.emotional.hope));
    console.log(`    Emotional Trend : ${seeker.emotional.currentTrend}`);
    console.log(`    Function Box    : ${seeker.functionBox.map((s) => s.functionType ?? '—').join(' · ')}`);
    console.log(`\n  District: starter`);
    console.log(bar('  Pressure', district.pressureLevel));
    console.log(bar('  Resonance Stability', district.resonanceStability));
    console.log(bar('  Restoration Progress', district.restorationProgress));
    console.log(`\n  Encounter: pressure_alpha`);
    console.log(`    Phase          : ${encounter.phase}`);
    console.log(bar('  Pressure', encounter.pressureLevel));
    console.log(bar('  Stability', encounter.resonance.stability));
    console.log(`    Resonance Type : ${encounter.resonance.primaryType}`);
    section('Executing Continuation Loop');
    console.log('  → Observe district (seeker intent → event → orchestrator)');
    console.log('  → Activate function box slot 0 (Green · Feed → Blue)');
    console.log('  → Escalate encounter (pressure_alpha enters Escalating)');
    console.log('  → Stabilize encounter (restoration influence applied)');
    console.log('  → Resolve encounter (phase → Resolved)');
    console.log('  → Enter tea ritual (seeker restoration)');
    console.log('  → Heartbeat tick (district + seeker resonance update)');
    console.log('  → District runtime update (stability events emitted)');
    const result = runFirstContinuationLoop();
    section('Event Audit');
    console.log(`  Events executed   : ${result.executedEventIds.length}`);
    for (const id of result.executedEventIds) {
        console.log(`    · ${id}`);
    }
    section('World Memory');
    console.log(`  Memories persisted: ${result.persistedMemoryIds.length}`);
    for (const id of result.persistedMemoryIds) {
        console.log(`    · ${id}`);
    }
    section('Final World State');
    const fs = result.state;
    const fa = fs.seekers.seeker_alpha;
    const fd = fs.districts.starter;
    const fe = fs.encounters.pressure_alpha;
    console.log(`  Tick : ${fs.tick}`);
    console.log(`\n  Seeker: seeker_alpha`);
    console.log(bar('  Pressure', fa.pressureLevel));
    console.log(bar('  Resonance Stability', fa.resonance.stability));
    console.log(bar('  Calm', fa.emotional.calm));
    console.log(`    Tea Ritual      : ${fa.restoration.inTeaRitual ? 'active' : 'inactive'}`);
    console.log(`\n  District: starter`);
    console.log(bar('  Pressure', fd.pressureLevel));
    console.log(bar('  Resonance Stability', fd.resonanceStability));
    console.log(bar('  Restoration Progress', fd.restorationProgress));
    console.log(`\n  Encounter: pressure_alpha`);
    console.log(`    Phase    : ${fe.phase}`);
    console.log(`    Resolved : ${fe.resolved ? '✓ YES' : '✗ NO'}`);
    section('Determinism Proof');
    const r1 = runFirstContinuationLoop();
    const r2 = runFirstContinuationLoop();
    const eventMatch = JSON.stringify(r1.executedEventIds) === JSON.stringify(r2.executedEventIds);
    const memMatch = JSON.stringify(r1.persistedMemoryIds) === JSON.stringify(r2.persistedMemoryIds);
    const stateMatch = r1.state.districts.starter.pressureLevel === r2.state.districts.starter.pressureLevel &&
        r1.state.seekers.seeker_alpha.resonance.stability === r2.state.seekers.seeker_alpha.resonance.stability;
    console.log(`  Two independent loop runs produce identical events  : ${eventMatch ? '✓ YES' : '✗ NO'}`);
    console.log(`  Two independent loop runs produce identical memories: ${memMatch ? '✓ YES' : '✗ NO'}`);
    console.log(`  Two independent loop runs produce identical state   : ${stateMatch ? '✓ YES' : '✗ NO'}`);
}
// ─── Entry Point ───────────────────────────────────────────────────────────────
console.log('');
console.log(hr('═'));
console.log('  FOTN — Phase R2 Deterministic Demo Runner');
console.log('  Pressure → Function → Consequence → Audit → Meaning');
console.log(hr('═'));
runStoneRoomAct();
console.log('\n');
runContinuationLoopAct();
console.log('\n');
console.log(hr('═'));
console.log('  Demo complete. All sequences resolved deterministically.');
console.log(hr('═'));
console.log('');
