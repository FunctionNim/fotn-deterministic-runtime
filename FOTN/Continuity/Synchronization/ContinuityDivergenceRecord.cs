namespace FOTN.Continuity.Synchronization;

/// <summary>
/// Records a detected mismatch between expected and observed continuity state.
/// </summary>
public sealed record ContinuityDivergenceRecord(
    Guid DivergenceId,
    Guid ExperienceId,
    ulong Tick,
    string ExpectedStateHash,
    string ObservedStateHash,
    DateTimeOffset DetectedAt
);
