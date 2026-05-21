namespace FOTN.Engine.Configuration;

public sealed record ContinuityRuntimeOptions
(
    string EnvironmentName,
    bool EnableReplay,
    bool EnableTelemetry,
    int SnapshotIntervalTicks
);
