namespace FOTN.Engine.Sacred;

/// <summary>
/// Synchronizes sacred manifestation state across deterministic runtime authorities.
/// </summary>
public sealed class SacredSynchronization
{
    public SacredState Synchronize(
        SacredState local,
        SacredState remote)
    {
        return local.AlignmentScore >= remote.AlignmentScore
            ? local
            : remote;
    }
}
