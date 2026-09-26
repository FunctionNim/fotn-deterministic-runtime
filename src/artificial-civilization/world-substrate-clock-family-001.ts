import { createHash } from "node:crypto"
import {
  hashAdaptiveContinuityClock001,
  runAdaptiveContinuityClockFamily001,
  type AdaptiveContinuityClockResult,
} from "./adaptive-continuity-clock-family-001.js"
import type {
  CivilizationState,
  HistoryRecord,
} from "./two-civilization-minimal-slice.js"

export const WORLD_SUBSTRATE_CLOCK_SCHEMA =
  "ACCQ-005-WORLD-SUBSTRATE-CLOCK-001-v0.1" as const

export type WorldSubstrateClockFamilyId = "WORLD_SUBSTRATE"

export interface WorldSubstrateClockFamilyRunRecord {
  family: WorldSubstrateClockFamilyId
  localCycle: number
  eligibilityBasis: "PRIOR_LOCAL_ADAPTATION_COMMITTED"
  sourceHistoryId: string
  resultHistoryId: string
  exactCadenceStatus: "HOLD"
}

export interface WorldSubstrateClockResult {
  schema: typeof WORLD_SUBSTRATE_CLOCK_SCHEMA
  sourceQualificationHashBefore: string
  sourceQualificationHashAfter: string
  additionalFamilies: readonly WorldSubstrateClockFamilyRunRecord[]
  civilizationB: CivilizationState
}

function clone<T>(value: T): T {
  return structuredClone(value)
}

export function runWorldSubstrateClockFamily001(): WorldSubstrateClockResult {
  const source: AdaptiveContinuityClockResult =
    runAdaptiveContinuityClockFamily001()
  const sourceQualificationHashBefore =
    hashAdaptiveContinuityClock001(source)

  const priorAdaptation = source.civilizationB.committedHistory.find(
    record => record.id === "B-HIST-003",
  )

  if (!priorAdaptation) {
    throw new Error("ACCQ-004 adaptive continuity record missing")
  }

  const civilizationB = clone(source.civilizationB)
  civilizationB.localCycle = priorAdaptation.localCycle + 1

  const substrateRecord: HistoryRecord = {
    id: "B-HIST-004",
    civilizationId: civilizationB.id,
    localCycle: civilizationB.localCycle,
    kind: "LOCAL_WORLD_SUBSTRATE_RESPONSE_FIXTURE",
    sourceRecordId: priorAdaptation.id,
    detail:
      "Synthetic fixture: Civilization B locally expresses its committed continuity adaptation as a bounded world/substrate consequence while preserving local provenance.",
  }

  civilizationB.committedHistory.push(substrateRecord)
  civilizationB.localResponseCount += 1

  const additionalFamilies: readonly WorldSubstrateClockFamilyRunRecord[] = [{
    family: "WORLD_SUBSTRATE",
    localCycle: civilizationB.localCycle,
    eligibilityBasis: "PRIOR_LOCAL_ADAPTATION_COMMITTED",
    sourceHistoryId: priorAdaptation.id,
    resultHistoryId: substrateRecord.id,
    exactCadenceStatus: "HOLD",
  }]

  const sourceQualificationHashAfter =
    hashAdaptiveContinuityClock001(source)

  return {
    schema: WORLD_SUBSTRATE_CLOCK_SCHEMA,
    sourceQualificationHashBefore,
    sourceQualificationHashAfter,
    additionalFamilies,
    civilizationB,
  }
}

export function canonicalWorldSubstrateClock001(
  result: WorldSubstrateClockResult,
): string {
  return JSON.stringify(result)
}

export function hashWorldSubstrateClock001(
  result: WorldSubstrateClockResult,
): string {
  return createHash("sha256")
    .update(canonicalWorldSubstrateClock001(result))
    .digest("hex")
}

export function validateWorldSubstrateClock001(
  result: WorldSubstrateClockResult,
): readonly string[] {
  const errors: string[] = []
  const family = result.additionalFamilies[0]
  const metabolism = result.civilizationB.committedHistory
    .find(record => record.id === "B-HIST-001")
  const memory = result.civilizationB.committedHistory
    .find(record => record.id === "B-HIST-002")
  const adaptation = result.civilizationB.committedHistory
    .find(record => record.id === "B-HIST-003")
  const substrate = result.civilizationB.committedHistory
    .find(record => record.id === "B-HIST-004")

  if (result.additionalFamilies.length !== 1) {
    errors.push("EXACTLY_ONE_ADDITIONAL_CLOCK_FAMILY_REQUIRED")
  }
  if (family?.family !== "WORLD_SUBSTRATE") {
    errors.push("UNEXPECTED_ADDITIONAL_CLOCK_FAMILY")
  }
  if (family?.exactCadenceStatus !== "HOLD") {
    errors.push("EXACT_CADENCE_MUST_REMAIN_HELD")
  }
  if (!metabolism || !memory || !adaptation || !substrate) {
    errors.push("REQUIRED_HISTORY_MISSING")
  }
  if (substrate?.sourceRecordId !== adaptation?.id) {
    errors.push("ADAPTATION_TO_SUBSTRATE_PROVENANCE_LINK_BROKEN")
  }
  if (
    substrate?.sourceRecordId === "A-HIST-001" ||
    substrate?.sourceRecordId === metabolism?.id ||
    substrate?.sourceRecordId === memory?.id
  ) {
    errors.push("SUBSTRATE_BYPASSED_LOCAL_ADAPTATION")
  }
  if (
    substrate &&
    adaptation &&
    substrate.localCycle !== adaptation.localCycle + 1
  ) {
    errors.push("DETERMINISTIC_LOCAL_ORDER_BROKEN")
  }
  if (
    result.sourceQualificationHashBefore !==
    result.sourceQualificationHashAfter
  ) {
    errors.push("QUALIFIED_ACC004_SOURCE_MUTATED")
  }

  return errors
}
