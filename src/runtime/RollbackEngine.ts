import {
  RuntimeState,
  RollbackCheckpoint,
  CanonicalEvent,
  RuntimeTick
} from "../contracts/runtime-contracts.js"

import {
  CanonicalHashGenerator
} from "../serialization/CanonicalHashGenerator.js"

import {
  ReplayEngine
} from "./ReplayEngine.js"

export class RollbackEngine {

  private checkpoints:
    RollbackCheckpoint[] = []

  private rollbackActive:
    boolean = false

  private rollbackTargetTick:
    RuntimeTick = 0

  public registerCheckpoint(
    checkpoint: RollbackCheckpoint
  ): void {

    this.checkpoints.push(
      Object.freeze(checkpoint)
    )
  }

  public getLatestCheckpoint():
    RollbackCheckpoint {

    const latest =
      this.checkpoints[
        this.checkpoints.length - 1
      ]

    if (!latest) {

      throw new Error(
        "No rollback checkpoints exist."
      )
    }

    return latest
  }

  public executeRollback(
    runtimeState: RuntimeState,
    replayEvents:
      readonly CanonicalEvent[],
    targetTick: RuntimeTick
  ): RuntimeState {

    this.rollbackActive = true

    this.rollbackTargetTick =
      targetTick

    const checkpoint =
      this.findClosestCheckpoint(
        targetTick
      )

    console.log(
      `[Rollback] Restoring checkpoint ${checkpoint.checkpointId}`
    )

    const replayEngine =
      new ReplayEngine(
        {
          replayId:
            "ROLLBACK_REPLAY",

          eventSequence:
            replayEvents,

          finalStateHash:
            runtimeState.canonicalStateHash
        },
        runtimeState
      )

    replayEngine.startReplay()

    const reconstructedState =
      replayEngine.getReplayState()

    const authoritativeHash =
      CanonicalHashGenerator.generate(
        runtimeState
      )

    const reconstructedHash =
      CanonicalHashGenerator.generate(
        reconstructedState
      )

    const equivalent =
      CanonicalHashGenerator
        .verifyEquivalence(
          authoritativeHash.stateHash,
          reconstructedHash.stateHash
        )

    if (!equivalent) {

      throw new Error(
        "Rollback reconstruction mismatch."
      )
    }

    this.rollbackActive = false

    console.log(
      "[Rollback] Equivalence restored."
    )

    return reconstructedState
  }

  private findClosestCheckpoint(
    runtimeTick: RuntimeTick
  ): RollbackCheckpoint {

    const ordered =
      [...this.checkpoints]
        .sort(
          (a, b) =>
            b.runtimeTick - a.runtimeTick
        )

    const checkpoint =
      ordered.find(
        c => c.runtimeTick <= runtimeTick
      )

    if (!checkpoint) {

      throw new Error(
        "No valid rollback checkpoint."
      )
    }

    return checkpoint
  }

  public isRollbackActive():
    boolean {

    return this.rollbackActive
  }
}