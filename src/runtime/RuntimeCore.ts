import {
  RuntimeState,
  RuntimeTick,
  SequenceNumber,
  CanonicalEvent
} from "../contracts/runtime-contracts"

import {
  AppendOnlyCanonicalEventBusV1
} from "../events/AppendOnlyCanonicalEventBusV1"

export class RuntimeCore {

  private runtimeState: RuntimeState

  private runtimeActive: boolean = false

  private runtimeTick: RuntimeTick = 0

  private sequenceNumber: SequenceNumber = 0

  private readonly eventBus =
    new AppendOnlyCanonicalEventBusV1()

  constructor(
    initialState: RuntimeState
  ) {

    this.runtimeState =
      initialState
  }

  public start(): void {

    this.runtimeActive = true

    while (this.runtimeActive) {

      this.executeDeterministicTick()
    }
  }

  public stop(): void {

    this.runtimeActive = false
  }

  private executeDeterministicTick():
    void {

    this.runtimeTick += 1

    console.log(
      `[Runtime Tick] ${this.runtimeTick}`
    )

    const canonicalEvents:
      CanonicalEvent[] = []

    for (const event of canonicalEvents) {

      console.log(
        `[Processing Event] ${event.eventType}`
      )
    }
  }

  public getRuntimeState():
    RuntimeState {

    return this.runtimeState
  }

  public getCurrentTick():
    RuntimeTick {

    return this.runtimeTick
  }

  public getCurrentSequence():
    SequenceNumber {

    return this.sequenceNumber
  }
}