namespace VisualContinuityClient.Prototype;

public sealed record PrototypeReplayViewer
(
    long CurrentTick,
    int TotalFrames,
    bool Visible,
    string ReplayHash
);
