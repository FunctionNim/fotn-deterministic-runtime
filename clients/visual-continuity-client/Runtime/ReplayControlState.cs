namespace VisualContinuityClient.Runtime;

public sealed record ReplayControlState
(
    bool Playing,
    double PlaybackSpeed,
    long CurrentTick,
    long TargetTick
);
