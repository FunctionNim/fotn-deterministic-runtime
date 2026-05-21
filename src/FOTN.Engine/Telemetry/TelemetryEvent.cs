namespace FOTN.Engine.Telemetry;

public sealed record TelemetryEvent
(
    string EventType,
    long Tick,
    string StateHash,
    string Message
);
