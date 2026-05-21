using FOTN.Engine.Runtime;
using FOTN.Engine.State;

namespace FOTN.Engine.Replay;

public sealed class SimpleReplayService
{
    private readonly IStateTransitionEngine _transitionEngine;

    public SimpleReplayService(
        IStateTransitionEngine transitionEngine
    )
    {
        _transitionEngine = transitionEngine;
    }

    public GameState Replay(
        GameState initialState,
        IEnumerable<RuntimeAction> actions
    )
    {
        var state = initialState;

        foreach (var action in actions)
        {
            state = _transitionEngine.Apply(state, action);
        }

        return state;
    }
}
