using System.Security.Cryptography;
using System.Text;

namespace FOTN.Engine.State;

public sealed class StateHashService
{
    public string ComputeHash(GameState state)
    {
        var builder = new StringBuilder();

        builder.Append(state.TurnNumber);
        builder.Append(state.CurrentPhase);
        builder.Append(state.DeterministicTick);

        foreach (var player in state.Players.OrderBy(x => x.PlayerId))
        {
            builder.Append(player.PlayerId);
            builder.Append(player.Momentum);
            builder.Append(player.Treasure);

            foreach (var function in player.FunctionBox.OrderBy(x => x))
            {
                builder.Append(function);
            }
        }

        using var sha = SHA256.Create();

        var bytes = Encoding.UTF8.GetBytes(builder.ToString());
        var hash = sha.ComputeHash(bytes);

        return Convert.ToHexString(hash);
    }
}
