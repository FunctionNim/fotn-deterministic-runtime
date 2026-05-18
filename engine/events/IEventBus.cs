namespace FOTN.Engine.Events;

public interface IEventBus
{
    void Publish(GameEvent gameEvent);

    void Subscribe<T>(Action<T> listener)
        where T : GameEvent;
}
