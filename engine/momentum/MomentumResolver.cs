using FOTN.Engine.State;

namespace FOTN.Engine.Momentum;

public sealed class MomentumResolver
{
    public void AddMomentum(
        PlayerState player,
        int amount)
    {
        player.Momentum += amount;

        if (player.Momentum < 0)
        {
            player.Momentum = 0;
        }

        if (player.Momentum > 30)
        {
            player.Momentum = 30;
        }
    }

    public IReadOnlyCollection<PlayerState> CheckWinners(
        IEnumerable<PlayerState> players)
    {
        return players
            .Where(x => x.Momentum >= 30)
            .ToList()
            .AsReadOnly();
    }
}
