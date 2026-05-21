using FOTN.Engine.Events;

namespace FOTN.Engine.Orchestration;

public sealed class DeterministicContinuityEventDispatcher : IContinuityEventDispatcher
{
    private readonly List<GameEvent> _dispatchedEvents = new();

    public IReadOnlyList<GameEvent> DispatchedEvents => _dispatchedEvents;

    public void Dispatch(GameEvent gameEvent)
    {
        _dispatchedEvents.Add(gameEvent);
    }
}
