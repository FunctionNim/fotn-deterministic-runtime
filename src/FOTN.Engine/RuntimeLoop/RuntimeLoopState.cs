namespace FOTN.Engine.RuntimeLoop;

public sealed record RuntimeLoopState
(
    long Tick,
    long Sequence,
    bool IsRunning,
    string StateHash
);
