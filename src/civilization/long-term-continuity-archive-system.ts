import type { WorldMemoryRecord } from '../runtime/continuity-event.js';

export enum ArchiveClassification {
  LocalMemory = 'LocalMemory',
  DistrictHistory = 'DistrictHistory',
  CivilizationRecord = 'CivilizationRecord',
  ContinuityAnchor = 'ContinuityAnchor',
  MythicArchive = 'MythicArchive',
}

export interface LongTermArchiveInput {
  readonly archiveId: string;
  readonly records: WorldMemoryRecord[];
}

export interface LongTermArchiveResult {
  readonly archiveId: string;
  readonly classification: ArchiveClassification;
  readonly preservedRecords: WorldMemoryRecord[];
  readonly archiveWeight: number;
}

export class LongTermContinuityArchiveSystem {
  public archive(input: LongTermArchiveInput): LongTermArchiveResult {
    const preservedRecords = input.records
      .filter((record) => record.historicalWeight >= 0.4)
      .sort((a, b) => b.historicalWeight - a.historicalWeight);

    const archiveWeight = clamp01(
      preservedRecords.reduce((total, record) => total + record.historicalWeight, 0)
        / Math.max(1, preservedRecords.length),
    );

    return {
      archiveId: input.archiveId,
      classification: classifyArchive(archiveWeight, preservedRecords.length),
      preservedRecords,
      archiveWeight,
    };
  }
}

function classifyArchive(archiveWeight: number, recordCount: number): ArchiveClassification {
  if (archiveWeight >= 0.85 && recordCount >= 5) return ArchiveClassification.MythicArchive;
  if (archiveWeight >= 0.75) return ArchiveClassification.ContinuityAnchor;
  if (archiveWeight >= 0.6) return ArchiveClassification.CivilizationRecord;
  if (archiveWeight >= 0.45) return ArchiveClassification.DistrictHistory;
  return ArchiveClassification.LocalMemory;
}

function clamp01(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(1, value));
}
