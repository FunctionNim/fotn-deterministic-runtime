namespace VisualContinuityClient.Runtime;

public sealed record RenderFrameState
(
    long Tick,
    string StateHash,
    bool Dirty,
    string FrameLabel
);
