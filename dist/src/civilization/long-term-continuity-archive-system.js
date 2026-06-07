export var ArchiveClassification;
(function (ArchiveClassification) {
    ArchiveClassification["LocalMemory"] = "LocalMemory";
    ArchiveClassification["DistrictHistory"] = "DistrictHistory";
    ArchiveClassification["CivilizationRecord"] = "CivilizationRecord";
    ArchiveClassification["ContinuityAnchor"] = "ContinuityAnchor";
    ArchiveClassification["MythicArchive"] = "MythicArchive";
})(ArchiveClassification || (ArchiveClassification = {}));
export class LongTermContinuityArchiveSystem {
    archive(input) {
        const preservedRecords = input.records
            .filter((record) => record.historicalWeight >= 0.4)
            .sort((a, b) => b.historicalWeight - a.historicalWeight);
        const archiveWeight = clamp01(preservedRecords.reduce((total, record) => total + record.historicalWeight, 0)
            / Math.max(1, preservedRecords.length));
        return {
            archiveId: input.archiveId,
            classification: classifyArchive(archiveWeight, preservedRecords.length),
            preservedRecords,
            archiveWeight,
        };
    }
}
function classifyArchive(archiveWeight, recordCount) {
    if (archiveWeight >= 0.85 && recordCount >= 5)
        return ArchiveClassification.MythicArchive;
    if (archiveWeight >= 0.75)
        return ArchiveClassification.ContinuityAnchor;
    if (archiveWeight >= 0.6)
        return ArchiveClassification.CivilizationRecord;
    if (archiveWeight >= 0.45)
        return ArchiveClassification.DistrictHistory;
    return ArchiveClassification.LocalMemory;
}
function clamp01(value) {
    if (Number.isNaN(value))
        return 0;
    return Math.max(0, Math.min(1, value));
}
