namespace VisualContinuityClient.Interface;

public sealed record BoardViewState
(
    int VisibleZones,
    int ActivePlayers,
    long Tick,
    string StateHash
);
