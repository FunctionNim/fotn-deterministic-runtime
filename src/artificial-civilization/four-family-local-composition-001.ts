import { createHash } from "node:crypto"
import {
  hashWorldSubstrateClock001,
  runWorldSubstrateClockFamily001,
  type WorldSubstrateClockResult,
} from "./world-substrate-clock-family-001.js"

export const FOUR_FAMILY_LOCAL_COMPOSITION_SCHEMA =
  "ACCQ-006-FOUR-FAMILY-LOCAL-COMPOSITION-001-v0.1" as const

export type QualifiedLocalFamily =
  | "CIVIC_METABOLISM"
  | "STEWARDSHIP_MEMORY"
  | "ADAPTIVE_CONTINUITY"
  | "WORLD_SUBSTRATE"

export interface LocalFamilyCompositionEntry {
  family: QualifiedLocalFamily
  historyId: string
  sourceHistoryId: string
  localCycle: number
}

export interface FourFamilyLocalCompositionResult {
  schema: typeof FOUR_FAMILY_LOCAL_COMPOSITION_SCHEMA
  sourceQualificationHashBefore: string
  sourceQualificationHashAfter: string
  orderedFamilies: readonly LocalFamilyCompositionEntry[]
  scheduler: "NONE"
  familyAuthority: "NONE"
  exactCadenceStatus: "HOLD"
  sameKeyCompositionStatus: "HOLD"
  historyCountBefore: number
  historyCountAfter: number
}

export function runFourFamilyLocalComposition001():
  FourFamilyLocalCompositionResult {
  const source: WorldSubstrateClockResult =
    runWorldSubstrateClockFamily001()
  const sourceQualificationHashBefore =
    hashWorldSubstrateClock001(source)
  const historyCountBefore =
    source.civilizationB.committedHistory.length

  const h1 = source.civilizationB.committedHistory
    .find(record => record.id === "B-HIST-001")
  const h2 = source.civilizationB.committedHistory
    .find(record => record.id === "B-HIST-002")
  const h3 = source.civilizationB.committedHistory
    .find(record => record.id === "B-HIST-003")
  const h4 = source.civilizationB.committedHistory
    .find(record => record.id === "B-HIST-004")

  if (!h1 || !h2 || !h3 || !h4) {
    throw new Error("Qualified four-family local history chain incomplete")
  }

  const orderedFamilies: readonly LocalFamilyCompositionEntry[] = [
    {
      family: "CIVIC_METABOLISM",
      historyId: h1.id,
      sourceHistoryId: h1.sourceRecordId ?? "",
      localCycle: h1.localCycle,
    },
    {
      family: "STEWARDSHIP_MEMORY",
      historyId: h2.id,
      sourceHistoryId: h2.sourceRecordId ?? "",
      localCycle: h2.localCycle,
    },
    {
      family: "ADAPTIVE_CONTINUITY",
      historyId: h3.id,
      sourceHistoryId: h3.sourceRecordId ?? "",
      localCycle: h3.localCycle,
    },
    {
      family: "WORLD_SUBSTRATE",
      historyId: h4.id,
      sourceHistoryId: h4.sourceRecordId ?? "",
      localCycle: h4.localCycle,
    },
  ]

  const historyCountAfter =
    source.civilizationB.committedHistory.length
  const sourceQualificationHashAfter =
    hashWorldSubstrateClock001(source)

  return {
    schema: FOUR_FAMILY_LOCAL_COMPOSITION_SCHEMA,
    sourceQualificationHashBefore,
    sourceQualificationHashAfter,
    orderedFamilies,
    scheduler: "NONE",
    familyAuthority: "NONE",
    exactCadenceStatus: "HOLD",
    sameKeyCompositionStatus: "HOLD",
    historyCountBefore,
    historyCountAfter,
  }
}

export function canonicalFourFamilyLocalComposition001(
  result: FourFamilyLocalCompositionResult,
): string {
  return JSON.stringify(result)
}

export function hashFourFamilyLocalComposition001(
  result: FourFamilyLocalCompositionResult,
): string {
  return createHash("sha256")
    .update(canonicalFourFamilyLocalComposition001(result))
    .digest("hex")
}

export function validateFourFamilyLocalComposition001(
  result: FourFamilyLocalCompositionResult,
): readonly string[] {
  const errors: string[] = []
  const expectedFamilies: readonly QualifiedLocalFamily[] = [
    "CIVIC_METABOLISM",
    "STEWARDSHIP_MEMORY",
    "ADAPTIVE_CONTINUITY",
    "WORLD_SUBSTRATE",
  ]
  const expectedHistory = [
    "B-HIST-001",
    "B-HIST-002",
    "B-HIST-003",
    "B-HIST-004",
  ]

  if (result.orderedFamilies.length !== 4) {
    errors.push("EXACTLY_FOUR_QUALIFIED_LOCAL_FAMILIES_REQUIRED")
  }
  if (
    result.orderedFamilies.map(entry => entry.family).join("|") !==
    expectedFamilies.join("|")
  ) {
    errors.push("LOCAL_FAMILY_ORDER_CHANGED")
  }
  if (
    result.orderedFamilies.map(entry => entry.historyId).join("|") !==
    expectedHistory.join("|")
  ) {
    errors.push("LOCAL_HISTORY_ORDER_CHANGED")
  }
  if (
    result.orderedFamilies[1]?.sourceHistoryId !== "B-HIST-001" ||
    result.orderedFamilies[2]?.sourceHistoryId !== "B-HIST-002" ||
    result.orderedFamilies[3]?.sourceHistoryId !== "B-HIST-003"
  ) {
    errors.push("LOCAL_PROVENANCE_CHAIN_BROKEN")
  }
  if (result.scheduler !== "NONE") {
    errors.push("UNAUTHORIZED_LOCAL_SCHEDULER_INTRODUCED")
  }
  if (result.familyAuthority !== "NONE") {
    errors.push("UNAUTHORIZED_FAMILY_AUTHORITY_INTRODUCED")
  }
  if (result.exactCadenceStatus !== "HOLD") {
    errors.push("EXACT_CADENCE_HOLD_BROKEN")
  }
  if (result.sameKeyCompositionStatus !== "HOLD") {
    errors.push("SAME_KEY_COMPOSITION_HOLD_BROKEN")
  }
  if (result.historyCountBefore !== result.historyCountAfter) {
    errors.push("COMPOSITION_TRIAL_MUTATED_HISTORY")
  }
  if (
    result.sourceQualificationHashBefore !==
    result.sourceQualificationHashAfter
  ) {
    errors.push("QUALIFIED_ACC005_SOURCE_MUTATED")
  }

  return errors
}
