using FOTN.Engine.Functions;
using FOTN.Engine.State;

namespace FOTN.Engine.Runtime;

public sealed class RuntimeTurnExecutor
{
    private readonly FunctionBoxRuntimeSystem _functions = new();

    public void ExecuteTurn(
        GameState state)
    {
        foreach (var player in state.Players.OrderBy(x => x.PlayerId))
        {
            if (!player.FunctionBox.Any())
            {
                _functions.AssignFunction(player, "Red");
            }

            state.DeterministicTick++;
        }
    }
}
