using FOTN.Engine.Events;

namespace FOTN.Engine.Orchestration;

public interface IContinuityEventDispatcher
{
    void Dispatch(GameEvent gameEvent);

    IReadOnlyList<GameEvent> DispatchedEvents { get; }
}
