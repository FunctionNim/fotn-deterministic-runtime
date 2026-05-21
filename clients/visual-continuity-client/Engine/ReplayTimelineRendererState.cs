namespace VisualContinuityClient.Engine;

public sealed record ReplayTimelineRendererState
(
    long Tick,
    int TotalFrames,
    bool Playing,
    string RenderHash
);
