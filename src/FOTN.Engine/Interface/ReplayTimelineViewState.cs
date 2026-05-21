namespace FOTN.Engine.Interface;

public sealed record ReplayTimelineViewState
(
    long CurrentTick,
    int TotalFrames,
    bool ReplayActive,
    string StateHash
);
