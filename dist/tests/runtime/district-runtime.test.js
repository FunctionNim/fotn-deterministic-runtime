import { describe, expect, it } from 'vitest';
import { DistrictRuntime } from '../../src/district/district-runtime.js';
import { EmotionalTrend, } from '../../src/runtime/index.js';
describe('DistrictRuntime', () => {
    it('emits pressure events for unstable districts', () => {
        const runtime = new DistrictRuntime();
        const result = runtime.update({
            generatedAtTick: 50,
            district: {
                districtId: 'starter',
                pressureLevel: 0.75,
                emotionalClimate: {
                    calm: 0.2,
                    fear: 0.8,
                    hope: 0.3,
                    curiosity: 0.4,
                    isolation: 0.5,
                    connection: 0.3,
                    currentTrend: EmotionalTrend.Distorting,
                },
                restorationProgress: 0.2,
                memoryPressure: 0.7,
                migrationPressure: 0.5,
                environmentStability: 0.6,
                resonanceStability: 0.4,
            },
        });
        expect(result.emittedEvents.length).toBeGreaterThan(0);
        expect(result.emittedEvents.some((event) => event.type === 'PressureShift')).toBe(true);
        expect(result.emittedEvents.some((event) => event.type === 'MemoryPropagated')).toBe(true);
    });
    it('emits restoration events for stabilized districts', () => {
        const runtime = new DistrictRuntime();
        const result = runtime.update({
            generatedAtTick: 60,
            district: {
                districtId: 'restoration-hall',
                pressureLevel: 0.2,
                emotionalClimate: {
                    calm: 0.8,
                    fear: 0.1,
                    hope: 0.9,
                    curiosity: 0.6,
                    isolation: 0.1,
                    connection: 0.8,
                    currentTrend: EmotionalTrend.Recovering,
                },
                restorationProgress: 0.9,
                memoryPressure: 0.2,
                migrationPressure: 0.1,
                environmentStability: 0.9,
                resonanceStability: 0.9,
            },
        });
        expect(result.emittedEvents.some((event) => event.type === 'RestorationApplied')).toBe(true);
    });
});
