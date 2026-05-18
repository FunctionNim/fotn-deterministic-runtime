namespace FOTN.Engine.Persistence;

/// <summary>
/// Validates persisted runtime snapshots before restoration.
/// </summary>
public static class SnapshotValidation
{
    public static bool Validate(RuntimeSnapshot snapshot)
    {
        return snapshot.Tick >= 0
            && !string.IsNullOrWhiteSpace(snapshot.StateHash)
            && !string.IsNullOrWhiteSpace(snapshot.CanonVersion);
    }
}
