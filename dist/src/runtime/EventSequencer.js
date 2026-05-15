// =====================================================
// EVENT SEQUENCER V1
// FUNCTIONS OF THE NOTHING
// =====================================================
// =====================================================
// EVENT SEQUENCER
// =====================================================
export class EventSequencer {
    currentRuntimeTick = 0;
    currentSequenceNumber = 0;
    lastEventId;
    currentPriorityPlayerId = "P1";
    priorityPassCount = 0;
    // ===================================================
    // ADVANCE RUNTIME TICK
    // ===================================================
    advanceRuntimeTick() {
        this.currentRuntimeTick += 1;
        this.priorityPassCount = 0;
        return this.currentRuntimeTick;
    }
    // ===================================================
    // GET CURRENT TICK
    // ===================================================
    getCurrentRuntimeTick() {
        return this.currentRuntimeTick;
    }
    // ===================================================
    // GENERATE SEQUENCE NUMBER
    // ===================================================
    generateSequenceNumber() {
        this.currentSequenceNumber += 1;
        return this.currentSequenceNumber;
    }
    // ===================================================
    // GET CURRENT SEQUENCE
    // ===================================================
    getCurrentSequenceNumber() {
        return this.currentSequenceNumber;
    }
    // ===================================================
    // RESOLVE CAUSAL PARENT
    // ===================================================
    resolveCausalParent() {
        return this.lastEventId;
    }
    // ===================================================
    // REGISTER EVENT LINEAGE
    // ===================================================
    registerEvent(eventId) {
        this.lastEventId = eventId;
    }
    // ===================================================
    // ORDER INPUTS DETERMINISTICALLY
    // ===================================================
    orderInputs(inputs) {
        return [...inputs]
            .sort((a, b) => {
            const typeOrder = a.eventType.localeCompare(b.eventType);
            if (typeOrder !== 0) {
                return typeOrder;
            }
            const sourceA = a.sourceEntityId ?? "";
            const sourceB = b.sourceEntityId ?? "";
            const sourceOrder = sourceA.localeCompare(sourceB);
            if (sourceOrder !== 0) {
                return sourceOrder;
            }
            const targetA = a.targetEntityIds.join(",");
            const targetB = b.targetEntityIds.join(",");
            return targetA.localeCompare(targetB);
        });
    }
    // ===================================================
    // OPEN INTERRUPTION WINDOW
    // ===================================================
    openInterruptionWindow(priorityPlayerId) {
        this.currentPriorityPlayerId =
            priorityPlayerId;
        this.priorityPassCount = 0;
    }
    // ===================================================
    // REGISTER PRIORITY PASS
    // ===================================================
    registerPriorityPass() {
        this.priorityPassCount += 1;
    }
    // ===================================================
    // INTERRUPTION WINDOW CLOSED?
    // ===================================================
    interruptionWindowClosed(totalPlayers) {
        return (this.priorityPassCount >=
            totalPlayers);
    }
    // ===================================================
    // VERIFY REPLAY SEQUENCE
    // ===================================================
    verifyReplaySequence(expectedSequence) {
        return (expectedSequence ===
            this.currentSequenceNumber);
    }
    // ===================================================
    // RESET
    // ===================================================
    reset() {
        this.currentRuntimeTick = 0;
        this.currentSequenceNumber = 0;
        this.lastEventId = undefined;
        this.priorityPassCount = 0;
    }
}
