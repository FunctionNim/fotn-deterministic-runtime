import type { WorldMemoryRecord } from '../runtime/continuity-event.js';

export interface DistrictMemoryState {
  readonly districtId: string;
  readonly records: WorldMemoryRecord[];
}

export interface MemorySynchronizationInput {
  readonly sourceDistrictId: string;
  readonly connectedDistrictIds: string[];
  readonly records: WorldMemoryRecord[];
}

export interface MemorySynchronizationResult {
  readonly districtMemories: DistrictMemoryState[];
}

export class WorldMemorySynchronizationSystem {
  public synchronize(input: MemorySynchronizationInput): MemorySynchronizationResult {
    const districtMemories: DistrictMemoryState[] = [];

    districtMemories.push({
      districtId: input.sourceDistrictId,
      records: input.records,
    });

    for (const districtId of input.connectedDistrictIds) {
      districtMemories.push({
        districtId,
        records: input.records
          .filter((record) => record.historicalWeight >= 0.5)
          .map((record) => ({
            ...record,
            recordId: `${record.recordId}:echo:${districtId}`,
            historicalWeight: Math.max(0, record.historicalWeight - 0.15),
            influencedDistricts: [districtId],
          })),
      });
    }

    return { districtMemories };
  }
}
