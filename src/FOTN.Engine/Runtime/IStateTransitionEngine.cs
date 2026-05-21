using FOTN.Engine.State;

namespace FOTN.Engine.Runtime;

public interface IStateTransitionEngine
{
    GameState Apply(
        GameState currentState,
        RuntimeAction action
    );
}
