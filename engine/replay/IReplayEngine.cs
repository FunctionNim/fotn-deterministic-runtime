using FOTN.Engine.Events;
using FOTN.Engine.State;

namespace FOTN.Engine.Replay;

public interface IReplayEngine
{
    GameState Replay(
        GameState initialState,
        IEnumerable<GameEvent> events
    );
}
