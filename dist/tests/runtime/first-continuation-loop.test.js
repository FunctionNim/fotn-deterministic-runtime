import { describe, expect, it } from 'vitest';
import { runFirstContinuationLoop, } from '../../src/prototype/first-continuation-loop.js';
describe('First playable continuation loop', () => {
    it('executes a deterministic continuation cycle', () => {
        const result = runFirstContinuationLoop();
        expect(result.executedEventIds.length)
            .toBeGreaterThan(0);
        expect(result.persistedMemoryIds.length)
            .toBeGreaterThan(0);
        expect(result.state.encounters.pressure_alpha.resolved)
            .toBe(true);
        expect(result.state.seekers.seeker_alpha.restoration.inTeaRitual)
            .toBe(true);
        expect(result.state.districts.starter.resonanceStability)
            .toBeGreaterThan(0);
    });
});
