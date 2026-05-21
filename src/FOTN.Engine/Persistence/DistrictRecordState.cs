namespace FOTN.Engine.Persistence;

public sealed record DistrictRecordState
(
    string DistrictId,
    string CivilizationId,
    long RecordedTick,
    string RecordHash
);
