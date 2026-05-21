namespace VisualContinuityClient.Unity;

public sealed record ReplayPanelPrefabState
(
    long CurrentTick,
    int TotalFrames,
    bool Visible,
    string PrefabHash
);
