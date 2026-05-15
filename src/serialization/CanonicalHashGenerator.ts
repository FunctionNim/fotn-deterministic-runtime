// =====================================================
// CANONICAL HASH GENERATOR V1
// FUNCTIONS OF THE NOTHING
// =====================================================

import crypto from "crypto"

import {
  RuntimeState,
  StateHash,
  AuditSignature,
  RuntimeTick,
  SequenceNumber
} from "../contracts/runtime-contracts.js"

import {
  CanonicalSerializer
} from "./CanonicalSerializer.js"

// =====================================================
// HASH RESULT
// =====================================================

export interface CanonicalHashResult {

  readonly runtimeTick:
    RuntimeTick

  readonly sequenceNumber:
    SequenceNumber

  readonly serializedState:
    string

  readonly stateHash:
    StateHash

  readonly auditSignature:
    AuditSignature
}

// =====================================================
// CANONICAL HASH GENERATOR
// =====================================================

export class CanonicalHashGenerator {

  // ===================================================
  // GENERATE HASH
  // ===================================================

  public static generate(
    runtimeState: RuntimeState
  ): CanonicalHashResult {

    const serializedState =
      CanonicalSerializer.serialize(
        runtimeState
      )

    const hash =
      crypto
        .createHash("sha256")
        .update(serializedState)
        .digest("hex")

    const auditSignature =
      this.generateAuditSignature(
        hash,
        runtimeState
      )

    return {
      runtimeTick:
        runtimeState.runtimeTick,

      sequenceNumber:
        runtimeState.sequenceNumber,

      serializedState,

      stateHash:
        hash,

      auditSignature
    }
  }

  // ===================================================
  // GENERATE AUDIT SIGNATURE
  // ===================================================

  public static generateAuditSignature(
    stateHash: StateHash,
    runtimeState: RuntimeState
  ): AuditSignature {

    const signaturePayload =
      `${runtimeState.runtimeTick}|` +
      `${runtimeState.sequenceNumber}|` +
      `${stateHash}`

    return crypto
      .createHash("sha256")
      .update(signaturePayload)
      .digest("hex")
  }

  // ===================================================
  // VERIFY EQUIVALENCE
  // ===================================================

  public static verifyEquivalence(
    authoritativeHash: StateHash,
    comparisonHash: StateHash
  ): boolean {

    return authoritativeHash === comparisonHash
  }
}