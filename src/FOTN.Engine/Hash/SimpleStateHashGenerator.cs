using FOTN.Engine.State;

namespace FOTN.Engine.Hash;

public sealed class SimpleStateHashGenerator : IStateHashGenerator
{
    public string Generate(GameState state)
    {
        return string.Join(
            "::",
            state.MatchId,
            state.DeterministicTick,
            state.TurnNumber,
            state.CurrentPhase
        );
    }
}
