namespace FOTN.Engine.Pressure;

public sealed record PressureState
(
    long Tick,
    int ActivePressureCount,
    string StateHash
);
