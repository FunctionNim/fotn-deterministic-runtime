import {
  RuntimeState,
  CanonicalEvent,
  ReplayRecord,
  RuntimeTick
} from "../contracts/runtime-contracts"

import {
  AppendOnlyCanonicalEventBusV1
} from "../events/AppendOnlyCanonicalEventBusV1"

import {
  CanonicalHashGenerator
} from "../serialization/CanonicalHashGenerator"

export class ReplayEngine {

  private replayState: RuntimeState

  private replayActive: boolean = false

  private replayCursor: number = 0

  private replayTick: RuntimeTick = 0

  private replayRecord: ReplayRecord

  private readonly eventBus =
    new AppendOnlyCanonicalEventBusV1()

  constructor(
    replayRecord: ReplayRecord,
    initialState: RuntimeState
  ) {

    this.replayRecord =
      replayRecord

    this.replayState =
      initialState
  }

  public startReplay(): void {

    this.replayActive = true

    this.replayCursor = 0

    this.replayTick = 0

    this.executeReplay()
  }

  public stopReplay(): void {

    this.replayActive = false
  }

  private executeReplay(): void {

    while (
      this.replayActive &&
      this.replayCursor <
      this.replayRecord.eventSequence.length
    ) {

      const event =
        this.replayRecord.eventSequence[
          this.replayCursor
        ]

      this.reconstructEvent(event)

      this.replayCursor += 1
    }

    this.verifyReplayEquivalence()
  }

  private reconstructEvent(
    event: CanonicalEvent
  ): void {

    this.replayTick =
      event.runtimeTick

    console.log(
      `[Replay Event] ${event.eventType}`
    )

    const replayHash =
      CanonicalHashGenerator.generate(
        this.replayState
      )

    const equivalent =
      CanonicalHashGenerator
        .verifyEquivalence(
          event.stateAfterHash,
          replayHash.stateHash
        )

    if (!equivalent) {

      throw new Error(
        "Replay equivalence failure."
      )
    }
  }

  private verifyReplayEquivalence():
    void {

    const finalReplayHash =
      CanonicalHashGenerator.generate(
        this.replayState
      )

    const equivalent =
      CanonicalHashGenerator
        .verifyEquivalence(
          this.replayRecord.finalStateHash,
          finalReplayHash.stateHash
        )

    if (!equivalent) {

      throw new Error(
        "Final replay equivalence failure."
      )
    }

    console.log(
      "[Replay] Equivalence verified."
    )
  }

  public getReplayState():
    RuntimeState {

    return this.replayState
  }

  public getReplayCursor():
    number {

    return this.replayCursor
  }

  public getReplayTick():
    RuntimeTick {

    return this.replayTick
  }
}