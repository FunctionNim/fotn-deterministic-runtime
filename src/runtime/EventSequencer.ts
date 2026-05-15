// =====================================================
// EVENT SEQUENCER V1
// FUNCTIONS OF THE NOTHING
// =====================================================

import {
  CanonicalEventInput,
  SequenceNumber,
  RuntimeTick,
  EventId
} from "../contracts/runtime-contracts.js"

// =====================================================
// EVENT SEQUENCER
// =====================================================

export class EventSequencer {

  private currentRuntimeTick:
    RuntimeTick = 0

  private currentSequenceNumber:
    SequenceNumber = 0

  private lastEventId:
    EventId | undefined

  private currentPriorityPlayerId:
    string = "P1"

  private priorityPassCount:
    number = 0

  // ===================================================
  // ADVANCE RUNTIME TICK
  // ===================================================

  public advanceRuntimeTick():
    RuntimeTick {

    this.currentRuntimeTick += 1

    this.priorityPassCount = 0

    return this.currentRuntimeTick
  }

  // ===================================================
  // GET CURRENT TICK
  // ===================================================

  public getCurrentRuntimeTick():
    RuntimeTick {

    return this.currentRuntimeTick
  }

  // ===================================================
  // GENERATE SEQUENCE NUMBER
  // ===================================================

  public generateSequenceNumber():
    SequenceNumber {

    this.currentSequenceNumber += 1

    return this.currentSequenceNumber
  }

  // ===================================================
  // GET CURRENT SEQUENCE
  // ===================================================

  public getCurrentSequenceNumber():
    SequenceNumber {

    return this.currentSequenceNumber
  }

  // ===================================================
  // RESOLVE CAUSAL PARENT
  // ===================================================

  public resolveCausalParent():
    EventId | undefined {

    return this.lastEventId
  }

  // ===================================================
  // REGISTER EVENT LINEAGE
  // ===================================================

  public registerEvent(
    eventId: EventId
  ): void {

    this.lastEventId = eventId
  }

  // ===================================================
  // ORDER INPUTS DETERMINISTICALLY
  // ===================================================

  public orderInputs(
    inputs:
      readonly CanonicalEventInput[]
  ): CanonicalEventInput[] {

    return [...inputs]
      .sort((a, b) => {

        const typeOrder =
          a.eventType.localeCompare(
            b.eventType
          )

        if (typeOrder !== 0) {
          return typeOrder
        }

        const sourceA =
          a.sourceEntityId ?? ""

        const sourceB =
          b.sourceEntityId ?? ""

        const sourceOrder =
          sourceA.localeCompare(
            sourceB
          )

        if (sourceOrder !== 0) {
          return sourceOrder
        }

        const targetA =
          a.targetEntityIds.join(",")

        const targetB =
          b.targetEntityIds.join(",")

        return targetA.localeCompare(
          targetB
        )
      })
  }

  // ===================================================
  // OPEN INTERRUPTION WINDOW
  // ===================================================

  public openInterruptionWindow(
    priorityPlayerId: string
  ): void {

    this.currentPriorityPlayerId =
      priorityPlayerId

    this.priorityPassCount = 0
  }

  // ===================================================
  // REGISTER PRIORITY PASS
  // ===================================================

  public registerPriorityPass():
    void {

    this.priorityPassCount += 1
  }

  // ===================================================
  // INTERRUPTION WINDOW CLOSED?
  // ===================================================

  public interruptionWindowClosed(
    totalPlayers: number
  ): boolean {

    return (
      this.priorityPassCount >=
      totalPlayers
    )
  }

  // ===================================================
  // VERIFY REPLAY SEQUENCE
  // ===================================================

  public verifyReplaySequence(
    expectedSequence:
      SequenceNumber
  ): boolean {

    return (
      expectedSequence ===
      this.currentSequenceNumber
    )
  }

  // ===================================================
  // RESET
  // ===================================================

  public reset(): void {

    this.currentRuntimeTick = 0

    this.currentSequenceNumber = 0

    this.lastEventId = undefined

    this.priorityPassCount = 0
  }
}