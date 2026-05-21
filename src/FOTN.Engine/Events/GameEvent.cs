namespace FOTN.Engine.Events;

public abstract record GameEvent
(
    Guid EventId,
    long Tick,
    string EventType,
    string SourceId
);
