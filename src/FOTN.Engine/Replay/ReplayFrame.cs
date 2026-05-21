namespace FOTN.Engine.Replay;

public sealed record ReplayFrame
(
    long Tick,
    long Sequence,
    string StateHash
);
