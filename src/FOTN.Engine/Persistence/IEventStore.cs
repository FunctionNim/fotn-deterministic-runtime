using FOTN.Engine.Events;

namespace FOTN.Engine.Persistence;

public interface IEventStore
{
    void Append(GameEvent gameEvent);

    IReadOnlyList<GameEvent> ReadAll();
}
