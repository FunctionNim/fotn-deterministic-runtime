namespace VisualContinuityClient.Interaction;

public sealed record ReplayScrubberState
(
    long CurrentTick,
    long MaxTick,
    bool Dragging,
    string StateHash
);
