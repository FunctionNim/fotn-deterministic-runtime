namespace FOTN.Engine.Networking;

/// <summary>
/// Detects replay or synchronization divergence between runtime nodes.
/// </summary>
public static class DivergenceDetection
{
    public static bool HasDiverged(
        NetworkSnapshot local,
        NetworkSnapshot remote)
    {
        return local.Tick != remote.Tick
            || local.StateHash != remote.StateHash;
    }
}
