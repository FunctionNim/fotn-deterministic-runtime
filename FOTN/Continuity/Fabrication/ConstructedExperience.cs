namespace FOTN.Continuity.Fabrication;

/// <summary>
/// A playable pressure environment constructed by continuity systems.
/// A constructed experience is not a disconnected match; it is a prepared
/// continuity event that can be synchronized, audited, replayed, and returned.
/// </summary>
public sealed record ConstructedExperience(
    Guid ExperienceId,
    string ExperienceName,
    string ModeKey,
    string CanonVersion,
    Guid ConstructedByCitizenId,
    DateTimeOffset ConstructedAt,
    bool RequiresAuditTrace,
    bool RequiresReplayTrace,
    bool CanGenerateVerdicts,
    bool CanFeedTrialMaterial
);
