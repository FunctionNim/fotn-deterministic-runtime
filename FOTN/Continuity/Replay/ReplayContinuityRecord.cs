namespace FOTN.Continuity.Replay;

/// <summary>
/// A replay-facing continuity record produced from a returned experience.
/// This record connects deterministic replay reconstruction to continuity processing.
/// </summary>
public sealed record ReplayContinuityRecord(
    Guid ExperienceId,
    string ReplayRecordId,
    ulong StartTick,
    ulong FinalTick,
    string InitialStateHash,
    string FinalStateHash,
    string CanonVersion,
    DateTimeOffset RecordedAt
);
