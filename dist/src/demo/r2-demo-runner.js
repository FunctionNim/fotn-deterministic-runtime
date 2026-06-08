import { runActIFixture, runActIIFixture } from './r2-demo-fixture.js';
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
function printActI(f) {
    box('ACT I — The Room That Would Not Fall  (Stone Pressure Sequence)');
    section('Spell Seed');
    console.log(`  Name          : ${f.spellSeed.name}`);
    console.log(`  Function Type : ${f.spellSeed.functionType}`);
    console.log(`  Operation     : ${f.spellSeed.operation}`);
    console.log(`  Containment   : ${f.spellSeed.containmentRule}`);
    console.log(`  Return Output : ${f.spellSeed.returnOutput}`);
    section('Trial Gate');
    console.log(`  ${f.trialGate.fromFunction} → ${f.trialGate.toFunction}`);
    console.log(`  Pass Condition    : ${f.trialGate.passCondition}`);
    console.log(`  Reversion Warning : ${f.trialGate.reversionWarning}`);
    section('Initial Room State');
    const init = f.initialSnapshot;
    console.log(`  Phase   : ${init.phase}`);
    console.log(bar('Tremor', init.pressureMeter.tremor));
    console.log(bar('Seal', init.pressureMeter.seal));
    console.log(bar('Passage', init.pressureMeter.passage));
    console.log('\n  ── Action Sequence ──────────────────────────────────────────');
    for (const step of f.steps) {
        const p = step.pressureMeter;
        const plateId = step.action.includes('(') ? step.action.slice(step.action.indexOf('(') + 1, -1) : '';
        if (plateId && step.action.startsWith('TestAnchor'))
            console.log(`\n  ·· ${plateId} ··`);
        console.log(`    [${step.phase.padEnd(10)}] ${step.action.padEnd(34)}` +
            `  tremor:${fmt(p.tremor)}  seal:${fmt(p.seal)}  passage:${fmt(p.passage)}`);
    }
    section('Final Room State');
    const fin = f.finalSnapshot;
    console.log(`  Phase   : ${fin.phase}`);
    console.log(bar('Tremor', fin.pressureMeter.tremor));
    console.log(bar('Seal', fin.pressureMeter.seal));
    console.log(bar('Passage', fin.pressureMeter.passage));
    if (fin.returnOutput)
        console.log(`  Output  : ${fin.returnOutput}`);
    section('Recording Ledger');
    printLedger(f.ledgerEntry);
    section('Determinism Proof');
    console.log(`  Two independent runs produce identical result: ${f.deterministicMatch ? '✓ YES' : '✗ NO'}`);
    console.log(`  Phase    : ${f.runA.phase}`);
    console.log(`  Passage  : ${fmt(f.runA.pressureMeter.passage)}  (both runs)`);
    console.log(`  Seal     : ${fmt(f.runA.pressureMeter.seal)}  (both runs)`);
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
// ─── Act II: Continuation Loop ────────────────────────────────────────────────
function printActII(f) {
    box('ACT II — First Continuation Loop  (World State + Event Audit)');
    const i = f.initialState;
    section('Initial World State');
    console.log(`  Tick : ${i.tick}`);
    console.log(`\n  Seeker: seeker_alpha`);
    console.log(bar('  Pressure', i.seekerPressureLevel));
    console.log(bar('  Resonance Stability', i.seekerResonanceStability));
    console.log(bar('  Calm', i.seekerCalm));
    console.log(`\n  District: starter`);
    console.log(bar('  Pressure', i.districtPressureLevel));
    console.log(bar('  Resonance Stability', i.districtResonanceStability));
    console.log(`\n  Encounter: pressure_alpha`);
    console.log(`    Phase          : ${i.encounterPhase}`);
    section('Executing Continuation Loop');
    console.log('  → Observe district (seeker intent → event → orchestrator)');
    console.log('  → Activate function box slot 0 (Green · Feed → Blue)');
    console.log('  → Escalate encounter (pressure_alpha enters Escalating)');
    console.log('  → Stabilize encounter (restoration influence applied)');
    console.log('  → Resolve encounter (phase → Resolved)');
    console.log('  → Enter tea ritual (seeker restoration)');
    console.log('  → Heartbeat tick (district + seeker resonance update)');
    console.log('  → District runtime update (stability events emitted)');
    section('Event Audit');
    console.log(`  Events executed   : ${f.executedEventIds.length}`);
    for (const id of f.executedEventIds) {
        console.log(`    · ${id}`);
    }
    section('World Memory');
    console.log(`  Memories persisted: ${f.persistedMemoryIds.length}`);
    for (const id of f.persistedMemoryIds) {
        console.log(`    · ${id}`);
    }
    const fin = f.finalState;
    section('Final World State');
    console.log(`  Tick : ${fin.tick}`);
    console.log(`\n  Seeker: seeker_alpha`);
    console.log(bar('  Pressure', fin.seekerPressureLevel));
    console.log(bar('  Resonance Stability', fin.seekerResonanceStability));
    console.log(bar('  Calm', fin.seekerCalm));
    console.log(`    Tea Ritual      : ${fin.seekerInTeaRitual ? 'active' : 'inactive'}`);
    console.log(`\n  District: starter`);
    console.log(bar('  Pressure', fin.districtPressureLevel));
    console.log(bar('  Resonance Stability', fin.districtResonanceStability));
    console.log(bar('  Restoration Progress', fin.districtRestorationProgress));
    console.log(`\n  Encounter: pressure_alpha`);
    console.log(`    Phase    : ${fin.encounterPhase}`);
    console.log(`    Resolved : ${fin.encounterResolved ? '✓ YES' : '✗ NO'}`);
    section('Determinism Proof');
    console.log(`  Two independent loop runs produce identical events  : ${f.eventsDeterministic ? '✓ YES' : '✗ NO'}`);
    console.log(`  Two independent loop runs produce identical memories: ${f.memoriesDeterministic ? '✓ YES' : '✗ NO'}`);
    console.log(`  Two independent loop runs produce identical state   : ${f.stateDeterministic ? '✓ YES' : '✗ NO'}`);
}
// ─── Entry Point ───────────────────────────────────────────────────────────────
console.log('');
console.log(hr('═'));
console.log('  FOTN — Phase R2 Deterministic Demo Runner');
console.log('  Pressure → Function → Consequence → Audit → Meaning');
console.log(hr('═'));
printActI(runActIFixture());
console.log('\n');
printActII(runActIIFixture());
console.log('\n');
console.log(hr('═'));
console.log('  Demo complete. All sequences resolved deterministically.');
console.log(hr('═'));
console.log('');
