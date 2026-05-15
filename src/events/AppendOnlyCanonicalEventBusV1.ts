import crypto from "crypto"
// =====================================================
// APPEND-ONLY CANONICAL EVENT BUS V1
// FUNCTIONS OF THE NOTHING
// =====================================================

import {
  CanonicalEvent,
  CanonicalEventInput,
  RuntimeState,
  EventType,
} from "../contracts/runtime-contracts.js"

import {
  CanonicalHashGenerator
} from "../serialization/CanonicalHashGenerator.js"

// =====================================================
// PROCESSOR CONTRACT
// =====================================================

export interface CanonicalProcessor {

  process(
    event: CanonicalEvent,
    runtimeState: RuntimeState
  ): void
}

// =====================================================
// EVENT BUS
// =====================================================

export class AppendOnlyCanonicalEventBusV1 {

  private readonly eventLog:
    CanonicalEvent[] = []

  private readonly processors:
    Map<
      EventType,
      CanonicalProcessor[]
    > = new Map()

  private sequenceNumber: number = 0

  private runtimeTick: number = 0

  // ===================================================
  // ACCESSORS
  // ===================================================

  public getCurrentSequence():
    number {

    return this.sequenceNumber
  }

  public getCurrentRuntimeTick():
    number {

    return this.runtimeTick
  }

  public getEventLog():
    readonly CanonicalEvent[] {

    return this.eventLog
  }

  // ===================================================
  // ADVANCE RUNTIME TICK
  // ===================================================

  public advanceRuntimeTick():
    void {

    this.runtimeTick += 1
  }

  // ===================================================
  // REGISTER PROCESSOR
  // ===================================================

  public registerProcessor(
    eventType: EventType,
    processor: CanonicalProcessor
  ): void {

    const existing =
      this.processors.get(
        eventType
      ) ?? []

    this.processors.set(
      eventType,
      [...existing, processor]
    )
  }

  // ===================================================
  // APPEND EVENT
  // ===================================================

  public appendEvent(
    input: CanonicalEventInput,
    runtimeState: RuntimeState
  ): CanonicalEvent {

    this.sequenceNumber += 1

    const preHash =
      CanonicalHashGenerator.generate(
        runtimeState
  )
    
    const postHash =
      CanonicalHashGenerator.generate(
        runtimeState
  )
  
    const canonicalEvent: CanonicalEvent = {
      

  eventId:
    crypto.randomUUID(),

  eventType:
    input.eventType,

  sequenceNumber:
    this.sequenceNumber,

  runtimeTick:
    this.runtimeTick,

  causalParentEventId:
    input.causalParentEventId,

  timestampUtc:
    new Date().toISOString(),

  sourceEntityId:
    input.sourceEntityId,

  targetEntityIds:
    input.targetEntityIds,

  payload:
    input.payload,

  stateBeforeHash:
    preHash.stateHash,

  stateAfterHash:
    postHash.stateHash,

  auditSignature:
    CanonicalHashGenerator.generateAuditSignature(
        postHash.stateHash,
        runtimeState
),

  immutabilityLock:
    true
}



    this.eventLog.push(
      Object.freeze(
        canonicalEvent
      )
    )

    return canonicalEvent
  }
}