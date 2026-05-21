using FOTN.Engine.State;

namespace FOTN.Engine.Runtime;

public sealed class DeterministicStateTransitionEngine : IStateTransitionEngine
{
    public GameState Apply(
        GameState currentState,
        RuntimeAction action
    )
    {
        currentState.DeterministicTick++;

        return currentState;
    }
}
