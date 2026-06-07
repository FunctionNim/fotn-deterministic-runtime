export class WorldMemorySynchronizationSystem {
    synchronize(input) {
        const districtMemories = [];
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
