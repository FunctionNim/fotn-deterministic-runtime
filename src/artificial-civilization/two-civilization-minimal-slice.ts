import { createHash } from "node:crypto"
import {
  createAccq001bWorldContainer,
  hashWorldContainer,
} from "../pyramid/world-container-contract.js"

export const ACCQ_002_SCHEMA = "ACCQ-002-v0.1" as const

export type CivilizationId = "CIV-A-ABEL-FIXTURE" | "CIV-B-RECEIVER-FIXTURE"
export type RouteStage =
  | "LOCAL_CONSEQUENCE"
  | "COMMITTED_HISTORY"
  | "LIVING_WORLD_HEART"
  | "NASHATA_OUTBOUND"
  | "UNDERFLOW"
  | "NASHATA_INBOUND"
  | "RECEIVING_WORLD_ADMISSION"
  | "LOCAL_RESPONSE"
  | "GAMERLASTONE_WITNESS"

export interface HistoryRecord {
  id: string
  civilizationId: CivilizationId
  localCycle: number
  kind: string
  sourceRecordId: string | null
  detail: string
}

export interface CivilizationState {
  id: CivilizationId
  localCycle: number
  committedHistory: HistoryRecord[]
  pendingEligibility: string[]
  localResponseCount: number
}

export interface ContinuityPacket {
  packetId: string
  originCivilizationId: CivilizationId
  originHistoryId: string
  influenceClass: "ECOLOGY_WARNING_FIXTURE"
  payload: "RESOURCE_STRAIN_OBSERVED"
  ordinaryMatterTransferred: false
  directRemoteMutationPermitted: false
}

export interface RouteTraceRecord {
  sequence: number
  stage: RouteStage
  actor: string
  artifactId: string
  detail: string
}

export interface GamerLaStoneWitness {
  evidenceClass: "SYNTHETIC_ENCOUNTER_FIXTURE"
  simulationTruthEstablished: true
  humanEncounterEstablished: false
  disposition: "SHAKE_NOT_YET_HUMAN_WITNESS"
  apertureSummary: string
}

export interface TwoCivilizationSliceResult {
  schema: typeof ACCQ_002_SCHEMA
  worldHashA: string
  worldHashB: string
  civilizationA: CivilizationState
  civilizationB: CivilizationState
  packet: ContinuityPacket
  trace: RouteTraceRecord[]
  gamerLaStone: GamerLaStoneWitness
  lensRecord: {
    primary: "NIMVEYRU"
    supports: readonly ["DYRONENIM", "NIMSARU"]
    role: "NON_AGENTIVE_OBSERVATION_ONLY"
  }
}
function clone<T>(value: T): T {
  return structuredClone(value)
}

function makeState(id: CivilizationId): CivilizationState {
  return {
    id,
    localCycle: 0,
    committedHistory: [],
    pendingEligibility: [],
    localResponseCount: 0,
  }
}

function appendHistory(
  state: CivilizationState,
  record: HistoryRecord,
): CivilizationState {
  const next = clone(state)
  next.committedHistory.push(record)
  return next
}

function trace(
  records: RouteTraceRecord[],
  stage: RouteStage,
  actor: string,
  artifactId: string,
  detail: string,
): void {
  records.push({
    sequence: records.length + 1,
    stage,
    actor,
    artifactId,
    detail,
  })
}

export function runAccq002MinimalSlice(): TwoCivilizationSliceResult {
  const worldA = createAccq001bWorldContainer()
  const worldB = createAccq001bWorldContainer()
  const traceRecords: RouteTraceRecord[] = []
  let a = makeState("CIV-A-ABEL-FIXTURE")
  let b = makeState("CIV-B-RECEIVER-FIXTURE")

  const localConsequence: HistoryRecord = {
    id: "A-HIST-001",
    civilizationId: a.id,
    localCycle: 1,
    kind: "LOCAL_ECOLOGY_CONSEQUENCE_FIXTURE",
    sourceRecordId: null,
    detail: "Synthetic fixture: a lawful local ecology consequence exists and is eligible for bounded outward continuity.",
  }
  trace(traceRecords, "LOCAL_CONSEQUENCE", a.id, localConsequence.id, localConsequence.detail)

  a.localCycle = 1
  a = appendHistory(a, localConsequence)
  trace(traceRecords, "COMMITTED_HISTORY", a.id, localConsequence.id, "Civilization A commits the consequence before any cross-realm circulation.")

  const packet: ContinuityPacket = {
    packetId: "PKT-A-B-001",
    originCivilizationId: a.id,
    originHistoryId: localConsequence.id,
    influenceClass: "ECOLOGY_WARNING_FIXTURE",
    payload: "RESOURCE_STRAIN_OBSERVED",
    ordinaryMatterTransferred: false,
    directRemoteMutationPermitted: false,
  }

  trace(traceRecords, "LIVING_WORLD_HEART", "HEPTIBARA_HEART_FIXTURE_A", packet.packetId, "Living World/Heart exposes only the bounded continuity packet.")
  trace(traceRecords, "NASHATA_OUTBOUND", "NASHATA", packet.packetId, "NaShaTa admits the outbound bounded packet without converting it into matter or local outcome.")
  trace(traceRecords, "UNDERFLOW", "UNDERFLOW", packet.packetId, "Underflow carries the packet as backend civilization influence.")
  trace(traceRecords, "NASHATA_INBOUND", "NASHATA", packet.packetId, "Receiving threshold holds the packet before local admission.")
  b.pendingEligibility.push(packet.payload)
  trace(traceRecords, "RECEIVING_WORLD_ADMISSION", "RECEIVING_WORLD_HEART_FIXTURE_B", packet.packetId, "Receiving world admits influence as eligibility input only; no direct remote mutation occurs.")

  b.localCycle = 1
  const response: HistoryRecord = {
    id: "B-HIST-001",
    civilizationId: b.id,
    localCycle: b.localCycle,
    kind: "LOCAL_CIVIC_METABOLISM_RESPONSE_FIXTURE",
    sourceRecordId: packet.originHistoryId,
    detail: "Synthetic fixture: Civilization B locally opens a carrying-capacity review in response to admitted resource-strain eligibility.",
  }
  b.localResponseCount += 1
  b = appendHistory(b, response)
  b.pendingEligibility = []
  trace(traceRecords, "LOCAL_RESPONSE", b.id, response.id, "Civilization B authors and commits its own local response.")

  const gamerLaStone: GamerLaStoneWitness = {
    evidenceClass: "SYNTHETIC_ENCOUNTER_FIXTURE",
    simulationTruthEstablished: true,
    humanEncounterEstablished: false,
    disposition: "SHAKE_NOT_YET_HUMAN_WITNESS",
    apertureSummary: "Backend causal route is available for later human presentation; no human encounter is claimed by this automated fixture.",
  }
  trace(traceRecords, "GAMERLASTONE_WITNESS", "GAMERLASTONE", "GLS-ACCQ-002-001", "External witness record created after committed simulation; human evidence remains unestablished.")

  return {
    schema: ACCQ_002_SCHEMA,
    worldHashA: hashWorldContainer(worldA),
    worldHashB: hashWorldContainer(worldB),
    civilizationA: a,
    civilizationB: b,
    packet,
    trace: traceRecords,
    gamerLaStone,
    lensRecord: {
      primary: "NIMVEYRU",
      supports: ["DYRONENIM", "NIMSARU"],
      role: "NON_AGENTIVE_OBSERVATION_ONLY",
    },
  }
}

export function canonicalAccq002(result: TwoCivilizationSliceResult): string {
  return JSON.stringify(result)
}

export function hashAccq002(result: TwoCivilizationSliceResult): string {
  return createHash("sha256").update(canonicalAccq002(result)).digest("hex")
}
export function validateAccq002(result: TwoCivilizationSliceResult): readonly string[] {
  const errors: string[] = []
  const stages = result.trace.map(x => x.stage)
  const required: RouteStage[] = [
    "LOCAL_CONSEQUENCE",
    "COMMITTED_HISTORY",
    "LIVING_WORLD_HEART",
    "NASHATA_OUTBOUND",
    "UNDERFLOW",
    "NASHATA_INBOUND",
    "RECEIVING_WORLD_ADMISSION",
    "LOCAL_RESPONSE",
    "GAMERLASTONE_WITNESS",
  ]
  if (JSON.stringify(stages) !== JSON.stringify(required)) errors.push("ROUTE_ORDER_MISMATCH")
  if (result.packet.ordinaryMatterTransferred) errors.push("ORDINARY_MATTER_TRANSFER_FORBIDDEN")
  if (result.packet.directRemoteMutationPermitted) errors.push("DIRECT_REMOTE_MUTATION_FORBIDDEN")
  if (result.civilizationA.committedHistory.length !== 1) errors.push("CIV_A_HISTORY_COUNT")
  if (result.civilizationB.committedHistory.length !== 1) errors.push("CIV_B_HISTORY_COUNT")
  if (result.civilizationB.committedHistory[0]?.sourceRecordId !== result.civilizationA.committedHistory[0]?.id) errors.push("CAUSAL_LINK_BROKEN")
  if (result.gamerLaStone.humanEncounterEstablished) errors.push("HUMAN_WITNESS_FABRICATED")
  if (result.lensRecord.role !== "NON_AGENTIVE_OBSERVATION_ONLY") errors.push("NIM_AGENCY_BREACH")
  return errors
}
