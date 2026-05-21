namespace FOTN.Engine.Players;

public sealed record PlayerTimerState
(
    string PlayerId,
    int TimeoutCount,
    bool AutoPassed
);
