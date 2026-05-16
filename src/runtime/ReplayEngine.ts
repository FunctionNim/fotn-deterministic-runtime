import {
  RuntimeState,
  ReplayRecord,
  CanonicalEvent
} from "../contracts/runtime-contracts.js"

import {
  CanonicalHashGenerator
} from "../serialization/CanonicalHashGenerator.js"

export class ReplayEngine {

  private replayState: RuntimeState

  private replayCursor = 0

  constructor(
    replayRecord: ReplayRecord,
    initialState: RuntimeState
  ) {

    this.replayState = initialState

    for (const event of replayRecord.eventSequence) {
      this.applyEvent(event)
    }

  }

  private applyEvent(
    event: CanonicalEvent
  ): void {

    this.replayCursor += 1

  }
public startReplay(): void {

  this.replayCursor = 0
}
  public getReplayState():
  RuntimeState {

    return this.replayState

  }

  public verifyReplay(
    authoritativeState: RuntimeState
  ): boolean {

    const authoritativeHash =
      CanonicalHashGenerator.generate(
        authoritativeState
      )

    const replayHash =
      CanonicalHashGenerator.generate(
        this.replayState
      )

    return (
      authoritativeHash.stateHash ===
      replayHash.stateHash
    )

  }

}