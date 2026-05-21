using FOTN.Engine.Events;
using FOTN.Engine.Persistence;

namespace FOTN.Tests;

public sealed class EventStorePersistenceTests
{
    private sealed record TestEvent(
        Guid EventId,
        long Tick,
        string EventType,
        string SourceId
    ) : GameEvent(EventId, Tick, EventType, SourceId);

    public void EventStore_ShouldPersistEvents()
    {
        var store = new InMemoryEventStore();

        store.Append(
            new TestEvent(
                Guid.NewGuid(),
                1,
                "TEST_EVENT",
                "SYSTEM"
            )
        );

        var events = store.ReadAll();

        if (events.Count != 1)
        {
            throw new Exception("Event persistence failed.");
        }
    }
}
