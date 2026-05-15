import { CanonicalHashGenerator } from "../serialization/CanonicalHashGenerator";
export class SynchronizationEngine {
    authoritativeHash = "";
    authoritativeTick = 0;
    authoritativeSequence = 0;
    synchronizationState = {
        synchronized: true,
        authoritativeHash: "",
        rollbackRequired: false,
        desyncDetected: false
    };
    verifyCanonicalState(runtimeStates) {
        if (runtimeStates.length === 0) {
            return this.synchronizationState;
        }
        const authoritativeResult = CanonicalHashGenerator.generate(runtimeStates[0]);
        this.authoritativeHash =
            authoritativeResult.stateHash;
        this.authoritativeTick =
            authoritativeResult.runtimeTick;
        this.authoritativeSequence =
            authoritativeResult.sequenceNumber;
        for (const state of runtimeStates) {
            const comparisonResult = CanonicalHashGenerator.generate(state);
            const equivalent = CanonicalHashGenerator
                .verifyEquivalence(authoritativeResult.stateHash, comparisonResult.stateHash);
            if (!equivalent) {
                this.synchronizationState = {
                    synchronized: false,
                    authoritativeHash: authoritativeResult.stateHash,
                    rollbackRequired: true,
                    desyncDetected: true
                };
                return this.synchronizationState;
            }
        }
        this.synchronizationState = {
            synchronized: true,
            authoritativeHash: authoritativeResult.stateHash,
            rollbackRequired: false,
            desyncDetected: false
        };
        return this.synchronizationState;
    }
    getSynchronizationState() {
        return this.synchronizationState;
    }
}
