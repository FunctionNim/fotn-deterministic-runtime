// =====================================================
// RUNTIME CONTRACTS V1
// FUNCTIONS OF THE NOTHING
// =====================================================

export type EntityId = string
export type EventId = string
export type CombatId = string
export type ReplayId = string
export type CheckpointId = string

export type RuntimeTick = number
export type SequenceNumber = number

export type StateHash = string
export type AuditSignature = string

export enum Zone {
  PUBLIC = "PUBLIC_ZONE",
  ENCOUNTER = "ENCOUNTER_ZONE",
  POLARITY = "POLARITY_ZONE",
  ABYSS = "ABYSS_ZONE",
  SURPRISE = "SURPRISE_ZONE"
}

export enum Phase {
  START = "START_PHASE",
  MAIN = "MAIN_PHASE",
  JOURNEY = "JOURNEY_PHASE",
  ALCHEMIST = "ALCHEMIST_PHASE",
  BATTLE = "BATTLE_PHASE",
  DAMAGE = "DAMAGE_PHASE",
  END = "END_PHASE"
}

export enum EventType {
  UNIT_ATTACKS_NOTHING_DECLARED =
    "UNIT_ATTACKS_NOTHING_DECLARED",

  UNIT_MOVED_TO_ENCOUNTER_ZONE =
    "UNIT_MOVED_TO_ENCOUNTER_ZONE",

  DECLARED_ATTACK_ENTERED_RESOLUTION =
    "DECLARED_ATTACK_ENTERED_RESOLUTION",

  ATTACK_RESPONSE_WINDOW_OPENED =
    "ATTACK_RESPONSE_WINDOW_OPENED",

  ATTACK_TARGET_VALIDATED =
    "ATTACK_TARGET_VALIDATED",

  NOTHING_COMBAT_STATE_CONFIRMED =
    "NOTHING_COMBAT_STATE_CONFIRMED",

  NOTHING_JUDGMENT_RESOLVED =
    "NOTHING_JUDGMENT_RESOLVED"
}

export interface CanonicalEntity {
  readonly entityId: EntityId
  readonly ownerId: string
  readonly zone: Zone
}

export interface CombatInstance {
  readonly combatId: CombatId

  readonly attackerIds:
    readonly EntityId[]

  readonly blockerIds:
    readonly EntityId[]

  readonly targetId: EntityId

  readonly combatResolved: boolean

  readonly judgmentCommitted: boolean
}

export interface RuntimeState {
  readonly runtimeTick:
    RuntimeTick

  readonly sequenceNumber:
    SequenceNumber

  readonly activePhase:
    Phase

  readonly activePlayerId:
    string

  readonly priorityPlayerId:
    string

  readonly stackDepth:
    number

  readonly entities:
    readonly CanonicalEntity[]

  readonly combatInstances:
    readonly CombatInstance[]

  readonly canonicalStateHash:
    StateHash
}

export interface CanonicalEvent<TPayload = unknown> {
  readonly eventId: EventId

  readonly eventType:
    EventType

  readonly sequenceNumber:
    SequenceNumber

  readonly runtimeTick:
    RuntimeTick

  readonly causalParentEventId?:
    EventId

  readonly timestampUtc:
    string

  readonly sourceEntityId?:
    EntityId

  readonly targetEntityIds:
    readonly EntityId[]

  readonly payload:
    TPayload

  readonly stateBeforeHash:
    StateHash

  readonly stateAfterHash:
    StateHash

  readonly auditSignature:
    AuditSignature

  readonly immutabilityLock:
    true
}
// =====================================================
// EVENT INPUT CONTRACT
// =====================================================

export interface CanonicalEventInput {

  readonly eventType:
    EventType

  readonly causalParentEventId?:
    EventId

  readonly sourceEntityId?:
    EntityId

  readonly targetEntityIds:
    readonly EntityId[]

  readonly payload:
    unknown
}
export interface SynchronizationState {

  readonly synchronized:
    boolean

  readonly authoritativeHash:
    StateHash

  readonly rollbackRequired:
    boolean

  readonly desyncDetected:
    boolean
}

export interface ReplayRecord {

  readonly replayId: string

  readonly eventSequence:
    readonly CanonicalEvent[]

  readonly finalStateHash:
    StateHash
}

export interface RollbackCheckpoint {

  readonly checkpointId:
    string

  readonly runtimeTick:
    RuntimeTick

  readonly sequenceNumber:
    SequenceNumber

  readonly canonicalStateHash:
    StateHash

  readonly serializedState:
    string
}