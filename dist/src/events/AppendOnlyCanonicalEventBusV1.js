import crypto from "crypto";
import { CanonicalHashGenerator } from "../serialization/CanonicalHashGenerator";
// =====================================================
// EVENT BUS
// =====================================================
export class AppendOnlyCanonicalEventBusV1 {
    eventLog = [];
    processors = new Map();
    sequenceNumber = 0;
    runtimeTick = 0;
    // ===================================================
    // ACCESSORS
    // ===================================================
    getCurrentSequence() {
        return this.sequenceNumber;
    }
    getCurrentRuntimeTick() {
        return this.runtimeTick;
    }
    getEventLog() {
        return this.eventLog;
    }
    // ===================================================
    // ADVANCE RUNTIME TICK
    // ===================================================
    advanceRuntimeTick() {
        this.runtimeTick += 1;
    }
    // ===================================================
    // REGISTER PROCESSOR
    // ===================================================
    registerProcessor(eventType, processor) {
        const existing = this.processors.get(eventType) ?? [];
        this.processors.set(eventType, [...existing, processor]);
    }
    // ===================================================
    // APPEND EVENT
    // ===================================================
    appendEvent(input, runtimeState) {
        this.sequenceNumber += 1;
        const preHash = CanonicalHashGenerator.generate(runtimeState);
        const canonicalEvent = {
            eventId: crypto.randomUUID(),
            eventType: input.eventType,
            sequenceNumber: this.sequenceNumber,
            runtimeTick: this.runtimeTick,
            causalParentEventId: input.causalParentEventId,
            timestampUtc: new Date().toISOString(),
            sourceEntityId: input.sourceEntityId,
            targetEntityIds: input.targetEntityIds,
            payload: input.payload,
            stateBeforeHash: preHash.stateHash,
            stateAfterHash: "",
            auditSignature: "",
            immutabilityLock: true
        };
        const processors = this.processors.get(canonicalEvent.eventType) ?? [];
        for (const processor of processors) {
            processor.process(canonicalEvent, runtimeState);
        }
        const postHash = CanonicalHashGenerator.generate(runtimeState);
        canonicalEvent.stateAfterHash =
            postHash.stateHash;
        canonicalEvent.auditSignature =
            postHash.auditSignature;
        this.eventLog.push(Object.freeze(canonicalEvent));
        return canonicalEvent;
    }
}
