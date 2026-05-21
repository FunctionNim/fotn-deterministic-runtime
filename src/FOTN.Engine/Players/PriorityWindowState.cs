namespace FOTN.Engine.Players;

public sealed record PriorityWindowState
(
    string ActivePlayerId,
    bool PriorityOpen,
    int PassCount,
    long Tick
);
