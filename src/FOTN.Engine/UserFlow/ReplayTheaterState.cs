namespace FOTN.Engine.UserFlow;

public sealed record ReplayTheaterState
(
    bool Active,
    long CurrentTick,
    int SpectatorCount,
    string StateHash
);
