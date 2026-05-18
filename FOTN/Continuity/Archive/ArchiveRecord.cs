namespace FOTN.Continuity.Archive;

/// <summary>
/// A preserved continuity artifact produced after processing.
/// </summary>
public sealed record ArchiveRecord(
    Guid ArchiveId,
    Guid SourceExperienceId,
    ContinuityArtifactType ArtifactType,
    string ArtifactReferenceId,
    string CanonVersion,
    DateTimeOffset ArchivedAt
);
