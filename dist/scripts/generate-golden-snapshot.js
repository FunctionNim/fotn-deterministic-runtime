import { writeFileSync, mkdirSync } from 'fs';
import { runActIFixture, runActIIFixture } from '../src/demo/r2-demo-fixture.js';
const actI = runActIFixture();
const actII = runActIIFixture();
const snapshot = {
    generatedAt: new Date().toISOString().slice(0, 10),
    phase: 'R2-R3',
    actI: {
        spellSeed: {
            name: actI.spellSeed.name,
            functionType: actI.spellSeed.functionType,
            containmentRule: actI.spellSeed.containmentRule,
            returnOutput: actI.spellSeed.returnOutput,
        },
        trialGate: {
            fromFunction: actI.trialGate.fromFunction,
            toFunction: actI.trialGate.toFunction,
            reversionWarning: actI.trialGate.reversionWarning,
        },
        stepCount: actI.steps.length,
        steps: actI.steps,
        initialSnapshot: actI.initialSnapshot,
        finalSnapshot: actI.finalSnapshot,
        ledgerEntry: actI.ledgerEntry,
        deterministicMatch: actI.deterministicMatch,
    },
    actII: {
        executedEventIds: actII.executedEventIds,
        persistedMemoryIds: actII.persistedMemoryIds,
        executedEventCount: actII.executedEventIds.length,
        persistedMemoryCount: actII.persistedMemoryIds.length,
        initialState: actII.initialState,
        finalState: actII.finalState,
        eventsDeterministic: actII.eventsDeterministic,
        memoriesDeterministic: actII.memoriesDeterministic,
        stateDeterministic: actII.stateDeterministic,
    },
};
mkdirSync('tests/golden', { recursive: true });
writeFileSync('tests/golden/r2-demo-snapshot.json', JSON.stringify(snapshot, null, 2) + '\n');
console.log('✓ Golden snapshot written → tests/golden/r2-demo-snapshot.json');
console.log(`  Act I  : ${snapshot.actI.stepCount} steps, deterministicMatch=${snapshot.actI.deterministicMatch}`);
console.log(`  Act II : ${snapshot.actII.executedEventCount} events, ${snapshot.actII.persistedMemoryCount} memories, stateDeterministic=${snapshot.actII.stateDeterministic}`);
