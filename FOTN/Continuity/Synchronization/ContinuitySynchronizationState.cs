namespace FOTN.Continuity.Synchronization;

/// <summary>
/// Represents synchronization readiness for a continuity experience.
/// Synchronization validates compatible pressure conditions before activation.
/// </summary>
public sealed record ContinuitySynchronizationState(
    Guid SynchronizationId,
    Guid ExperienceId,
    bool AuditReady,
    bool ReplayReady,
    bool ParticipantsReady,
    bool ContinuityStable,
    bool GoldObservationEnabled,
    bool SophiaGuidanceEnabled,
    DateTimeOffset SynchronizedAt
);
