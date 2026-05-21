namespace FOTN.Engine.State;

public sealed record ContinuityState
(
    Guid MatchId,
    long Tick,
    int Version,
    string StateHash
)
{
    public static ContinuityState CreateNew(Guid matchId)
    {
        return new ContinuityState(matchId, 0, 0, string.Empty);
    }
}
