using FOTN.Engine.Actions;
using FOTN.Engine.State;

namespace FOTN.Engine.Turns;

public sealed class TurnManager
{
    public void AdvancePhase(GameState state)
    {
        state.CurrentPhase = state.CurrentPhase switch
        {
            Phase.StartOfTurn => Phase.MainStep,
            Phase.MainStep => Phase.BattleStep,
            Phase.BattleStep => Phase.DamagePhase,
            Phase.DamagePhase => Phase.EndStep,
            Phase.EndStep => Phase.StartOfTurn,
            _ => throw new InvalidOperationException("Unknown phase state.")
        };

        if (state.CurrentPhase == Phase.StartOfTurn)
        {
            state.TurnNumber++;
        }

        state.DeterministicTick++;
    }

    public void ResetPriority(GameState state)
    {
        foreach (var player in state.Players)
        {
            player.HasPassedPriority = false;
        }
    }

    public bool AllPlayersPassedPriority(GameState state)
    {
        return state.Players.All(x => x.HasPassedPriority);
    }
}
