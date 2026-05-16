// =====================================================
// CANONICAL HASH GENERATOR V1
// FUNCTIONS OF THE NOTHING
// =====================================================
import crypto from "crypto";
import { CanonicalSerializer } from "./CanonicalSerializer";
// =====================================================
// CANONICAL HASH GENERATOR
// =====================================================
export class CanonicalHashGenerator {
    // ===================================================
    // GENERATE HASH
    // ===================================================
    static generate(runtimeState) {
        const serializedState = CanonicalSerializer.serialize(runtimeState);
        const hash = crypto
            .createHash("sha256")
            .update(serializedState)
            .digest("hex");
        const auditSignature = this.generateAuditSignature(hash, runtimeState);
        return {
            runtimeTick: runtimeState.runtimeTick,
            sequenceNumber: runtimeState.sequenceNumber,
            serializedState,
            stateHash: hash,
            auditSignature
        };
    }
    // ===================================================
    // GENERATE AUDIT SIGNATURE
    // ===================================================
    static generateAuditSignature(stateHash, runtimeState) {
        const signaturePayload = `${runtimeState.runtimeTick}|` +
            `${runtimeState.sequenceNumber}|` +
            `${stateHash}`;
        return crypto
            .createHash("sha256")
            .update(signaturePayload)
            .digest("hex");
    }
    // ===================================================
    // VERIFY EQUIVALENCE
    // ===================================================
    static verifyEquivalence(authoritativeHash, comparisonHash) {
        return authoritativeHash === comparisonHash;
    }
}
