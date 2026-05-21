using FOTN.Engine.Events;

namespace FOTN.Engine.Pressure;

public sealed record PressurePropagationEvent(
    Guid EventId,
    long Tick,
    string EventType,
    string SourceId,
    string PressureType,
    int PressureValue
) : GameEvent(EventId, Tick, EventType, SourceId);
