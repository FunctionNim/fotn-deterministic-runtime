namespace FOTN.Engine.Persistence;

/// <summary>
/// Metadata manifest describing persistence snapshot collections.
/// </summary>
public sealed class SaveManifest
{
    public string CanonVersion { get; init; } = string.Empty;

    public ulong LatestTick { get; init; }

    public int SnapshotCount { get; init; }
}
