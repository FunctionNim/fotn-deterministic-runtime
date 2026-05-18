namespace FOTN.Continuity.Archive;

/// <summary>
/// A lightweight reference to a preserved continuity artifact.
/// </summary>
public sealed record ArchiveReference(
    Guid ArchiveId,
    ContinuityArtifactType ArtifactType,
    string ArtifactReferenceId
);
