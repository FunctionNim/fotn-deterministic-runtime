import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';
import { runActIFixture, runActIIFixture } from '../src/demo/r2-demo-fixture.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const manifestPath = join(__dirname, '..', 'tests', 'golden', 'r2-demo-manifest.json');
const snapshotPath = join(__dirname, '..', 'tests', 'golden', 'r2-demo-snapshot.json');

function hr(char = '─', width = 60): string { return char.repeat(width); }

const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
const snapshot = JSON.parse(readFileSync(snapshotPath, 'utf-8'));

const actI = runActIFixture();
const actII = runActIIFixture();

console.log('');
console.log('═'.repeat(60));
console.log('  FOTN — Audit Manifest Verification');
console.log('═'.repeat(60));

console.log(`\n  Phase       : ${manifest.phase}`);
console.log(`  Lock Status : ${manifest.lockStatus}`);
console.log(`  Locked At   : ${manifest.lockedAt}`);
console.log(`  Snapshot At : ${snapshot.generatedAt}`);
console.log(`\n  Fixture : ${manifest.fixtureSource}`);
console.log(`  Snapshot: ${manifest.snapshotSource}`);

console.log(`\n${hr()}`);
console.log('  Manifest Expected vs. Live Fixture');
console.log(hr());

type CheckResult = { label: string; expected: unknown; actual: unknown; pass: boolean };
const checks: CheckResult[] = [];

function check(label: string, expected: unknown, actual: unknown): void {
  checks.push({ label, expected, actual, pass: expected === actual });
}

check('Action sequence count (Act I)', manifest.expectedActionSequenceCount, actI.steps.length);
check('Event count (Act II)',           manifest.expectedEventCount,          actII.executedEventIds.length);
check('World memory count (Act II)',    manifest.expectedWorldMemoryCount,    actII.persistedMemoryIds.length);
check('deterministicFlags.actI',        manifest.deterministicFlags.actI,     actI.deterministicMatch);
check('deterministicFlags.actIIEvents', manifest.deterministicFlags.actIIEvents, actII.eventsDeterministic);
check('deterministicFlags.actIIMemories', manifest.deterministicFlags.actIIMemories, actII.memoriesDeterministic);
check('deterministicFlags.actIIState',  manifest.deterministicFlags.actIIState, actII.stateDeterministic);

for (const c of checks) {
  const mark = c.pass ? '✓' : '✗';
  const status = c.pass ? 'PASS' : 'FAIL';
  console.log(`  ${mark} [${status}] ${c.label.padEnd(38)} expected=${c.expected}  actual=${c.actual}`);
}

console.log(`\n${hr()}`);
console.log('  Snapshot Drift Check');
console.log(hr());

const snapshotChecks: CheckResult[] = [];
function snapCheck(label: string, expected: unknown, actual: unknown): void {
  snapshotChecks.push({ label, expected, actual, pass: JSON.stringify(expected) === JSON.stringify(actual) });
}

snapCheck('Act I step count',        snapshot.actI.stepCount,           actI.steps.length);
snapCheck('Act I final phase',       snapshot.actI.finalSnapshot.phase, actI.finalSnapshot.phase);
snapCheck('Act I final passage',     snapshot.actI.finalSnapshot.pressureMeter.passage, actI.finalSnapshot.pressureMeter.passage);
snapCheck('Act I ledger entryId',    snapshot.actI.ledgerEntry.entryId, actI.ledgerEntry.entryId);
snapCheck('Act I steps',             snapshot.actI.steps,               actI.steps);
snapCheck('Act II event IDs',        snapshot.actII.executedEventIds,   actII.executedEventIds);
snapCheck('Act II memory IDs',       snapshot.actII.persistedMemoryIds, actII.persistedMemoryIds);
snapCheck('Act II final state',      snapshot.actII.finalState,         actII.finalState);

for (const c of snapshotChecks) {
  const mark = c.pass ? '✓' : '✗';
  const status = c.pass ? 'PASS' : 'DRIFT';
  const value = typeof c.expected === 'object' ? '(object)' : String(c.expected);
  console.log(`  ${mark} [${status}] ${c.label.padEnd(26)} snapshot=${value}`);
}

const allPass = [...checks, ...snapshotChecks].every((c) => c.pass);
console.log(`\n${hr()}`);
console.log(`  Result: ${allPass ? '✓ All checks pass — snapshot is current.' : '✗ Drift detected — review and run: npm run generate-snapshot'}`);
console.log('═'.repeat(60));
console.log('');

process.exit(allPass ? 0 : 1);
