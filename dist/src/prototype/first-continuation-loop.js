import { EncounterRuntime, stabilizeEncounter } from '../encounter/encounter-runtime.js';
import { FunctionBoxRuntime } from '../function-box/function-box-runtime.js';
import { DistrictRuntime } from '../district/district-runtime.js';
import { intentToContinuityEvent, InputSurface, SeekerIntentType } from '../seeker/seeker-intent.js';
import { ContinuityEventOrchestrator, ContinuityHeartbeat, EmotionalTrend, EncounterPhase, FunctionType, RelationshipType, ResonanceType, } from '../runtime/index.js';
export function createFirstContinuationState() {
    return {
        tick: 0,
        seekers: {
            seeker_alpha: {
                seekerId: 'seeker_alpha',
                pressureLevel: 0.1,
                exhaustionLevel: 0.2,
                activeMemories: [],
                functionRelationships: [
                    {
                        source: FunctionType.Green,
                        target: FunctionType.Blue,
                        relationship: RelationshipType.Feed,
                        influenceStrength: 1,
                        bidirectional: false,
                    },
                    {
                        source: FunctionType.Stone,
                        target: FunctionType.Red,
                        relationship: RelationshipType.Opposition,
                        influenceStrength: 1,
                        bidirectional: false,
                    },
                ],
                functionBox: [
                    {
                        slotIndex: 0,
                        functionType: FunctionType.Green,
                        resonanceState: ResonanceType.Stable,
                        availableAbilityIds: ['stabilize-growth'],
                    },
                    {
                        slotIndex: 1,
                        functionType: FunctionType.Blue,
                        resonanceState: ResonanceType.Stable,
                        availableAbilityIds: ['guided-movement'],
                    },
                    {
                        slotIndex: 2,
                        functionType: FunctionType.Stone,
                        resonanceState: ResonanceType.Stable,
                        availableAbilityIds: ['anchor-pressure'],
                    },
                ],
                resonance: {
                    stability: 0.7,
                    synchronization: 0.4,
                    distortion: 0.1,
                    emotionalIntensity: 0.2,
                    primaryType: ResonanceType.Stable,
                    activeModifiers: [],
                },
                emotional: {
                    calm: 0.7,
                    fear: 0.1,
                    hope: 0.6,
                    curiosity: 0.7,
                    isolation: 0.1,
                    connection: 0.5,
                    currentTrend: EmotionalTrend.Settling,
                },
                synchronization: {
                    level: 0.4,
                    linkedContinuities: [],
                    isOverloaded: false,
                },
                restoration: {
                    emotionalRecovery: 0.05,
                    resonanceRecovery: 0.05,
                    inTeaRitual: false,
                    inCommunalCraft: false,
                    synchronizationBoost: 0,
                },
                identity: {
                    districtAffinities: {
                        starter: 0.3,
                    },
                    symbolicMarks: [],
                },
            },
        },
        districts: {
            starter: {
                districtId: 'starter',
                pressureLevel: 0.25,
                emotionalClimate: {
                    calm: 0.7,
                    fear: 0.1,
                    hope: 0.7,
                    curiosity: 0.5,
                    isolation: 0.1,
                    connection: 0.7,
                    currentTrend: EmotionalTrend.Settling,
                },
                restorationProgress: 0.4,
                memoryPressure: 0.1,
                migrationPressure: 0.15,
                environmentStability: 0.85,
                resonanceStability: 0.8,
            },
        },
        encounters: {
            pressure_alpha: {
                encounterId: 'pressure_alpha',
                phase: EncounterPhase.Entering,
                pressureLevel: 0.45,
                activeEffectIds: [],
                resolved: false,
                resonance: {
                    stability: 0.35,
                    synchronization: 0.2,
                    distortion: 0.4,
                    emotionalIntensity: 0.5,
                    primaryType: ResonanceType.Pressured,
                    activeModifiers: [],
                },
            },
        },
    };
}
export function runFirstContinuationLoop() {
    const state = createFirstContinuationState();
    const heartbeat = new ContinuityHeartbeat();
    const orchestrator = new ContinuityEventOrchestrator();
    const functionBox = new FunctionBoxRuntime();
    const districtRuntime = new DistrictRuntime();
    const encounterRuntime = new EncounterRuntime();
    const executedEventIds = [];
    const persistedMemoryIds = [];
    const observeEvent = intentToContinuityEvent({
        intentId: 'observe-starter',
        seekerId: 'seeker_alpha',
        type: SeekerIntentType.Observe,
        surface: InputSurface.Desktop,
        targetId: 'starter',
        generatedAtTick: state.tick,
    });
    const observeResult = orchestrator.execute(state, [observeEvent]);
    executedEventIds.push(...observeResult.executedEventIds);
    persistedMemoryIds.push(...observeResult.persistedMemories.map((memory) => memory.recordId));
    const seeker = state.seekers.seeker_alpha;
    if (!seeker)
        throw new Error('Expected seeker_alpha to exist.');
    const functionResult = functionBox.activateSlot({
        slots: seeker.functionBox,
        relationships: seeker.functionRelationships,
        activatedSlotIndex: 0,
    });
    seeker.functionBox = functionResult.affectedSlots;
    seeker.resonance.activeModifiers.push(...functionResult.resonanceModifiers);
    const encounter = state.encounters.pressure_alpha;
    if (!encounter)
        throw new Error('Expected pressure_alpha to exist.');
    const escalatedEncounter = encounterRuntime.update({
        encounter,
        districtId: 'starter',
        generatedAtTick: state.tick + 1,
    });
    state.encounters.pressure_alpha = escalatedEncounter.encounter;
    const stabilizedEncounter = stabilizeEncounter(state.encounters.pressure_alpha, 0.6);
    state.encounters.pressure_alpha = {
        ...stabilizedEncounter,
        phase: EncounterPhase.Resolved,
        resolved: true,
    };
    const resolvedEncounter = encounterRuntime.update({
        encounter: state.encounters.pressure_alpha,
        districtId: 'starter',
        generatedAtTick: state.tick + 2,
    });
    const encounterResult = orchestrator.execute(state, [
        ...escalatedEncounter.emittedEvents,
        ...resolvedEncounter.emittedEvents,
    ]);
    executedEventIds.push(...encounterResult.executedEventIds);
    persistedMemoryIds.push(...encounterResult.persistedMemories.map((memory) => memory.recordId));
    seeker.restoration.inTeaRitual = true;
    const restoreEvent = intentToContinuityEvent({
        intentId: 'restore-after-pressure',
        seekerId: 'seeker_alpha',
        type: SeekerIntentType.Restore,
        surface: InputSurface.Mobile,
        targetId: 'starter',
        generatedAtTick: state.tick + 3,
    });
    const restoreResult = orchestrator.execute(state, [restoreEvent]);
    executedEventIds.push(...restoreResult.executedEventIds);
    persistedMemoryIds.push(...restoreResult.persistedMemories.map((memory) => memory.recordId));
    heartbeat.tick(state);
    const districtResult = districtRuntime.update({
        district: state.districts.starter,
        generatedAtTick: state.tick,
    });
    state.districts.starter = districtResult.district;
    const districtEventsResult = orchestrator.execute(state, districtResult.emittedEvents);
    executedEventIds.push(...districtEventsResult.executedEventIds);
    persistedMemoryIds.push(...districtEventsResult.persistedMemories.map((memory) => memory.recordId));
    return {
        state,
        executedEventIds,
        persistedMemoryIds,
    };
}
