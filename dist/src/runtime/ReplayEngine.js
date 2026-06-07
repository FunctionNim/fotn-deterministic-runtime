import { CanonicalHashGenerator } from "../serialization/CanonicalHashGenerator.js";
export class ReplayEngine {
    replayState;
    replayCursor = 0;
    constructor(replayRecord, initialState) {
        this.replayState = initialState;
        for (const event of replayRecord.eventSequence) {
            this.applyEvent(event);
        }
    }
    applyEvent(event) {
        this.replayCursor += 1;
    }
    startReplay() {
        this.replayCursor = 0;
    }
    getReplayState() {
        return this.replayState;
    }
    verifyReplay(authoritativeState) {
        const authoritativeHash = CanonicalHashGenerator.generate(authoritativeState);
        const replayHash = CanonicalHashGenerator.generate(this.replayState);
        return (authoritativeHash.stateHash ===
            replayHash.stateHash);
    }
}
