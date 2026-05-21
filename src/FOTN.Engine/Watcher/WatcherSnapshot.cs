namespace FOTN.Engine.Watcher;

public sealed record WatcherSnapshot
(
    long Tick,
    string StateHash,
    int VisibleAuditEvents,
    int VisibleReplayFrames,
    int VisiblePressureNodes,
    bool InformationBoxReady
);
