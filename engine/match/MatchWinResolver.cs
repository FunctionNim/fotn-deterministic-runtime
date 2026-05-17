using FOTN.Engine.State;

namespace FOTN.Engine.Match;

public sealed class MatchWinResolver
{
    public IReadOnlyCollection<PlayerState> ResolveWinners(GameState state)
    {
        return state.Players
            .Where(x => x.Momentum >= 30)
            .OrderBy(x => x.PlayerId)
            .ToList()
            .AsReadOnly();
    }

    public bool MatchComplete(GameState state)
    {
        return state.Players.Any(x => x.Momentum >= 30);
    }
}
