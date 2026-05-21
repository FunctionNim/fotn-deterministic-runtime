namespace VisualContinuityClient.Interface;

public sealed record ReplayViewerState
(
    long CurrentTick,
    int TotalFrames,
    bool Playing,
    string StateHash
);
