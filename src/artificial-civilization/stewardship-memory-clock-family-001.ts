import { createHash } from "node:crypto"
import {
  canonicalAccq002,
  hashAccq002,
  runAccq002MinimalSlice,
  type CivilizationState,
  type HistoryRecord,
} from "./two-civilization-minimal-slice.js"

export const STEWARDSHIP_MEMORY_CLOCK_SCHEMA =
  "ACCQ-003-STEWARDSHIP-MEMORY-CLOCK-001-v0.1" as const

export type AdditionalClockFamilyId = "STEWARDSHIP_MEMORY"

export interface ClockFamilyRunRecord {
  family: AdditionalClockFamilyId
  localCycle: number
  eligibilityBasis: "PRIOR_LOCAL_RESPONSE_COMMITTED"
  sourceHistoryId: string
  resultHistoryId: string
  exactCadenceStatus: "HOLD"
}

export interface StewardshipMemoryClockResult {
  schema: typeof STEWARDSHIP_MEMORY_CLOCK_SCHEMA
  sourceSimulationHashBefore: string
  sourceSimulationHashAfter: string
  additionalFamilies: readonly ClockFamilyRunRecord[]
  civilizationB: CivilizationState
}

function clone<T>(value: T): T {
  return structuredClone(value)
}

export function runStewardshipMemoryClockFamily001(): StewardshipMemoryClockResult {
  const source = runAccq002MinimalSlice()
  const sourceSimulationHashBefore = hashAccq002(source)
  const priorResponse = source.civilizationB.committedHistory.find(
    record => record.id === "B-HIST-001",
  )

  if (!priorResponse) {
    throw new Error("ACCQ-002 receiving response missing")
  }

  const civilizationB = clone(source.civilizationB)
  civilizationB.localCycle = priorResponse.localCycle + 1

  const memoryRecord: HistoryRecord = {
    id: "B-HIST-002",
    civilizationId: civilizationB.id,
    localCycle: civilizationB.localCycle,
    kind: "LOCAL_STEWARDSHIP_MEMORY_RESPONSE_FIXTURE",
    sourceRecordId: priorResponse.id,
    detail:
      "Synthetic fixture: Civilization B locally records the carrying-capacity review as bounded civic memory with provenance preserved.",
  }

  civilizationB.committedHistory.push(memoryRecord)
  civilizationB.localResponseCount += 1

  const additionalFamilies: readonly ClockFamilyRunRecord[] = [{
    family: "STEWARDSHIP_MEMORY",
    localCycle: civilizationB.localCycle,
    eligibilityBasis: "PRIOR_LOCAL_RESPONSE_COMMITTED",
    sourceHistoryId: priorResponse.id,
    resultHistoryId: memoryRecord.id,
    exactCadenceStatus: "HOLD",
  }]

  const sourceSimulationHashAfter = hashAccq002(source)

  return {
    schema: STEWARDSHIP_MEMORY_CLOCK_SCHEMA,
    sourceSimulationHashBefore,
    sourceSimulationHashAfter,
    additionalFamilies,
    civilizationB,
  }
}

export function canonicalStewardshipMemoryClock001(
  result: StewardshipMemoryClockResult,
): string {
  return JSON.stringify(result)
}

export function hashStewardshipMemoryClock001(
  result: StewardshipMemoryClockResult,
): string {
  return createHash("sha256")
    .update(canonicalStewardshipMemoryClock001(result))
    .digest("hex")
}

export function validateStewardshipMemoryClock001(
  result: StewardshipMemoryClockResult,
): readonly string[] {
  const errors: string[] = []
  const family = result.additionalFamilies[0]
  const sourceRecord = result.civilizationB.committedHistory
    .find(record => record.id === "B-HIST-001")
  const memoryRecord = result.civilizationB.committedHistory
    .find(record => record.id === "B-HIST-002")

  if (result.additionalFamilies.length !== 1) {
    errors.push("EXACTLY_ONE_ADDITIONAL_CLOCK_FAMILY_REQUIRED")
  }
  if (family?.family !== "STEWARDSHIP_MEMORY") {
    errors.push("UNEXPECTED_ADDITIONAL_CLOCK_FAMILY")
  }
  if (family?.exactCadenceStatus !== "HOLD") {
    errors.push("EXACT_CADENCE_MUST_REMAIN_HELD")
  }
  if (!sourceRecord || !memoryRecord) {
    errors.push("REQUIRED_HISTORY_MISSING")
  }
  if (memoryRecord?.sourceRecordId !== sourceRecord?.id) {
    errors.push("LOCAL_PROVENANCE_LINK_BROKEN")
  }
  if (memoryRecord?.sourceRecordId === "A-HIST-001") {
    errors.push("REMOTE_SOURCE_BYPASSED_LOCAL_AUTHORSHIP")
  }
  if (result.sourceSimulationHashBefore !== result.sourceSimulationHashAfter) {
    errors.push("QUALIFIED_SOURCE_SIMULATION_MUTATED")
  }

  return errors
}
