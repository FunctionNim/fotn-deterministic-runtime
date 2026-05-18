namespace FOTN.Engine.Networking;

/// <summary>
/// Authoritative synchronization coordinator for deterministic runtime continuity.
/// </summary>
public sealed class SynchronizationAuthority
{
    public bool Verify(
        NetworkSnapshot local,
        NetworkSnapshot remote)
    {
        return !DivergenceDetection.HasDiverged(local, remote);
    }
}
