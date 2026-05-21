using FOTN.Engine.Events;

namespace FOTN.Engine.Persistence;

public sealed class InMemoryEventStore : IEventStore
{
    private readonly List<GameEvent> _eventList = new();

    public void Append(GameEvent gameEvent)
    {
        _eventList.Add(gameEvent);
    }

    public IReadOnlyList<GameEvent> ReadAll()
    {
        return _eventList;
    }
}
