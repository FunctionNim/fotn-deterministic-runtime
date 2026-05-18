namespace FOTN.Continuity.Synchronization;

/// <summary>
/// Requests continuity recovery after divergence is detected.
/// </summary>
public sealed record ContinuityRecoveryRequest(
    Guid RecoveryId,
    Guid ExperienceId,
    ulong RecoveryTick,
    string TargetStateHash,
    string CanonVersion,
    DateTimeOffset RequestedAt
);
