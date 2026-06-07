import { describe, expect, it } from 'vitest';
import { ContinuityEventOrchestrator, EmotionalTrend, EventType, ResonanceType, } from '../../src/runtime/index.js';
function createRuntimeState() {
    return {
        tick: 0,
        seekers: {},
        encounters: {},
        districts: {
            starter: {
                districtId: 'starter',
                pressureLevel: 0.2,
                emotionalClimate: {
                    calm: 0.8,
                    fear: 0.1,
                    hope: 0.7,
                    curiosity: 0.5,
                    isolation: 0.1,
                    connection: 0.7,
                    currentTrend: EmotionalTrend.Settling,
                },
                restorationProgress: 0.3,
                memoryPressure: 0.1,
                migrationPressure: 0.2,
                environmentStability: 0.9,
                resonanceStability: 0.8,
            },
        },
    };
}
describe('ContinuityEventOrchestrator', () => {
    it('executes deterministic event ordering', () => {
        const orchestrator = new ContinuityEventOrchestrator();
        const state = createRuntimeState();
        const result = orchestrator.execute(state, [
            {
                eventId: 'b-event',
                type: EventType.RestorationApplied,
                resonance: ResonanceType.Restoring,
                emotionalWeight: 0.8,
                propagationStrength: 0.6,
                affectedDistricts: ['starter'],
                generatedAtTick: 5,
            },
            {
                eventId: 'a-event',
                type: EventType.PressureShift,
                resonance: ResonanceType.Pressured,
                emotionalWeight: 0.5,
                propagationStrength: 0.5,
                affectedDistricts: ['starter'],
                generatedAtTick: 5,
            },
        ]);
        expect(result.executedEventIds).toEqual([
            'a-event',
            'b-event',
        ]);
        expect(result.persistedMemories.length).toBe(1);
        expect(result.persistedMemories[0].recordId)
            .toBe('memory:b-event');
    });
});
