import { createHash } from "node:crypto"
import {
  hashStewardshipMemoryClock001,
  runStewardshipMemoryClockFamily001,
  type StewardshipMemoryClockResult,
} from "./stewardship-memory-clock-family-001.js"
import type {
  CivilizationState,
  HistoryRecord,
} from "./two-civilization-minimal-slice.js"

export const ADAPTIVE_CONTINUITY_CLOCK_SCHEMA =
  "ACCQ-004-ADAPTIVE-CONTINUITY-CLOCK-001-v0.1" as const

export type AdaptiveClockFamilyId = "ADAPTIVE_CONTINUITY"

export interface AdaptiveClockFamilyRunRecord {
  family: AdaptiveClockFamilyId
  localCycle: number
  eligibilityBasis: "PRIOR_LOCAL_MEMORY_COMMITTED"
  sourceHistoryId: string
  resultHistoryId: string
  exactCadenceStatus: "HOLD"
}

export interface AdaptiveContinuityClockResult {
  schema: typeof ADAPTIVE_CONTINUITY_CLOCK_SCHEMA
  sourceQualificationHashBefore: string
  sourceQualificationHashAfter: string
  additionalFamilies: readonly AdaptiveClockFamilyRunRecord[]
  civilizationB: CivilizationState
}

function clone<T>(value: T): T {
  return structuredClone(value)
}

export function runAdaptiveContinuityClockFamily001(): AdaptiveContinuityClockResult {
  const source: StewardshipMemoryClockResult =
    runStewardshipMemoryClockFamily001()
  const sourceQualificationHashBefore =
    hashStewardshipMemoryClock001(source)

  const priorMemory = source.civilizationB.committedHistory.find(
    record => record.id === "B-HIST-002",
  )

  if (!priorMemory) {
    throw new Error("ACCQ-003 stewardship/memory record missing")
  }

  const civilizationB = clone(source.civilizationB)
  civilizationB.localCycle = priorMemory.localCycle + 1

  const adaptiveRecord: HistoryRecord = {
    id: "B-HIST-003",
    civilizationId: civilizationB.id,
    localCycle: civilizationB.localCycle,
    kind: "LOCAL_ADAPTIVE_CONTINUITY_RESPONSE_FIXTURE",
    sourceRecordId: priorMemory.id,
    detail:
      "Synthetic fixture: Civilization B locally converts its bounded civic memory into a continuity adaptation that preserves provenance without remote authorship.",
  }

  civilizationB.committedHistory.push(adaptiveRecord)
  civilizationB.localResponseCount += 1

  const additionalFamilies: readonly AdaptiveClockFamilyRunRecord[] = [{
    family: "ADAPTIVE_CONTINUITY",
    localCycle: civilizationB.localCycle,
    eligibilityBasis: "PRIOR_LOCAL_MEMORY_COMMITTED",
    sourceHistoryId: priorMemory.id,
    resultHistoryId: adaptiveRecord.id,
    exactCadenceStatus: "HOLD",
  }]

  const sourceQualificationHashAfter =
    hashStewardshipMemoryClock001(source)

  return {
    schema: ADAPTIVE_CONTINUITY_CLOCK_SCHEMA,
    sourceQualificationHashBefore,
    sourceQualificationHashAfter,
    additionalFamilies,
    civilizationB,
  }
}

export function canonicalAdaptiveContinuityClock001(
  result: AdaptiveContinuityClockResult,
): string {
  return JSON.stringify(result)
}

export function hashAdaptiveContinuityClock001(
  result: AdaptiveContinuityClockResult,
): string {
  return createHash("sha256")
    .update(canonicalAdaptiveContinuityClock001(result))
    .digest("hex")
}

export function validateAdaptiveContinuityClock001(
  result: AdaptiveContinuityClockResult,
): readonly string[] {
  const errors: string[] = []
  const family = result.additionalFamilies[0]
  const metabolismRecord = result.civilizationB.committedHistory
    .find(record => record.id === "B-HIST-001")
  const memoryRecord = result.civilizationB.committedHistory
    .find(record => record.id === "B-HIST-002")
  const adaptiveRecord = result.civilizationB.committedHistory
    .find(record => record.id === "B-HIST-003")

  if (result.additionalFamilies.length !== 1) {
    errors.push("EXACTLY_ONE_ADDITIONAL_CLOCK_FAMILY_REQUIRED")
  }
  if (family?.family !== "ADAPTIVE_CONTINUITY") {
    errors.push("UNEXPECTED_ADDITIONAL_CLOCK_FAMILY")
  }
  if (family?.exactCadenceStatus !== "HOLD") {
    errors.push("EXACT_CADENCE_MUST_REMAIN_HELD")
  }
  if (!metabolismRecord || !memoryRecord || !adaptiveRecord) {
    errors.push("REQUIRED_HISTORY_MISSING")
  }
  if (adaptiveRecord?.sourceRecordId !== memoryRecord?.id) {
    errors.push("MEMORY_TO_ADAPTATION_PROVENANCE_LINK_BROKEN")
  }
  if (
    adaptiveRecord?.sourceRecordId === "A-HIST-001" ||
    adaptiveRecord?.sourceRecordId === metabolismRecord?.id
  ) {
    errors.push("ADAPTATION_BYPASSED_LOCAL_MEMORY")
  }
  if (
    adaptiveRecord &&
    memoryRecord &&
    adaptiveRecord.localCycle !== memoryRecord.localCycle + 1
  ) {
    errors.push("DETERMINISTIC_LOCAL_ORDER_BROKEN")
  }
  if (
    result.sourceQualificationHashBefore !==
    result.sourceQualificationHashAfter
  ) {
    errors.push("QUALIFIED_ACC003_SOURCE_MUTATED")
  }

  return errors
}
