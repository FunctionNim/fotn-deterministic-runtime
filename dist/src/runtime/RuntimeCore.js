import { AppendOnlyCanonicalEventBusV1 } from "../events/AppendOnlyCanonicalEventBusV1.js";
export class RuntimeCore {
    runtimeState;
    runtimeActive = false;
    runtimeTick = 0;
    sequenceNumber = 0;
    eventBus = new AppendOnlyCanonicalEventBusV1();
    constructor(initialState) {
        this.runtimeState =
            initialState;
    }
    start() {
        this.runtimeActive = true;
        while (this.runtimeActive) {
            this.executeDeterministicTick();
        }
    }
    stop() {
        this.runtimeActive = false;
    }
    executeDeterministicTick() {
        this.runtimeTick += 1;
        console.log(`[Runtime Tick] ${this.runtimeTick}`);
        const canonicalEvents = [];
        for (const event of canonicalEvents) {
            console.log(`[Processing Event] ${event.eventType}`);
        }
    }
    getRuntimeState() {
        return this.runtimeState;
    }
    getCurrentTick() {
        return this.runtimeTick;
    }
    getCurrentSequence() {
        return this.sequenceNumber;
    }
}
