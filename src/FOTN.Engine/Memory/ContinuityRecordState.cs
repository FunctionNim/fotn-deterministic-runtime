namespace FOTN.Engine.Memory;

public sealed record ContinuityRecordState
(
    string RecordId,
    long Tick,
    int ArchiveCount,
    int PatternCount,
    string RecordHash
);
