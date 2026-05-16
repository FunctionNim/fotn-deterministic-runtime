import {
  RuntimeState,
  StateHash,
  SynchronizationState,
  RuntimeTick,
  SequenceNumber
} from "../contracts/runtime-contracts.js"

import {
  CanonicalHashGenerator
} from "../serialization/CanonicalHashGenerator.js"

export class SynchronizationEngine {

  private authoritativeHash:
    StateHash = ""

  private authoritativeTick:
    RuntimeTick = 0

  private authoritativeSequence:
    SequenceNumber = 0

  private synchronizationState:
    SynchronizationState = {

      synchronized: true,

      authoritativeHash: "",

      rollbackRequired: false,

      desyncDetected: false
    }

  public verifyCanonicalState(
    runtimeStates:
      readonly RuntimeState[]
  ): SynchronizationState {

    if (runtimeStates.length === 0) {

      return this.synchronizationState
    }

    const authoritativeResult =
      CanonicalHashGenerator.generate(
        runtimeStates[0]
      )

    this.authoritativeHash =
      authoritativeResult.stateHash

    this.authoritativeTick =
      authoritativeResult.runtimeTick

    this.authoritativeSequence =
      authoritativeResult.sequenceNumber

    for (const state of runtimeStates) {

      const comparisonResult =
        CanonicalHashGenerator.generate(
          state
        )

      const equivalent =
        CanonicalHashGenerator
          .verifyEquivalence(
            authoritativeResult.stateHash,
            comparisonResult.stateHash
          )

      if (!equivalent) {

        this.synchronizationState = {

          synchronized: false,

          authoritativeHash:
            authoritativeResult.stateHash,

          rollbackRequired: true,

          desyncDetected: true
        }

        return this.synchronizationState
      }
    }

    this.synchronizationState = {

      synchronized: true,

      authoritativeHash:
        authoritativeResult.stateHash,

      rollbackRequired: false,

      desyncDetected: false
    }

    return this.synchronizationState
  }

  public getSynchronizationState():
    SynchronizationState {

    return this.synchronizationState
  }
}