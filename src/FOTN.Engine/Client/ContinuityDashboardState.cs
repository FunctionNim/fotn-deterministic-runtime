namespace FOTN.Engine.Client;

public sealed record ContinuityDashboardState
(
    long Tick,
    int ActivePlayers,
    int ActiveEvents,
    int ActiveConvergences,
    string StateHash
);
