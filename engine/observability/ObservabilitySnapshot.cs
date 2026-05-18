namespace FOTN.Engine.Observability;

public sealed record ObservabilitySnapshot
(
    long Tick,
    string StateHash,
    int AuditEventCount,
    int ReplayFrameCount,
    int ActivePressureCount
);
