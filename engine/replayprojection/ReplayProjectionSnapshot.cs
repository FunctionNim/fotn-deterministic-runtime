namespace FOTN.Engine.ReplayProjection;

public sealed record ReplayProjectionSnapshot
(
    long Tick,
    string StateHash,
    int TimelineFrames,
    int VisibleAuditEvents,
    bool HiddenResolutionProtected
);
