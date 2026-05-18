namespace FOTN.Continuity.Archive;

/// <summary>
/// Routes processed continuity artifacts into archive records.
/// </summary>
public sealed class ArchiveRoutingService
{
    public ArchiveRecord CreateArchiveRecord(
        Guid archiveId,
        Guid sourceExperienceId,
        ContinuityArtifactType artifactType,
        string artifactReferenceId,
        string canonVersion,
        DateTimeOffset archivedAt)
    {
        return new ArchiveRecord(
            archiveId,
            sourceExperienceId,
            artifactType,
            artifactReferenceId,
            canonVersion,
            archivedAt
        );
    }
}
