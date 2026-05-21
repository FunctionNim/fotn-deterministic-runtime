namespace FOTN.Engine.Interpretation;

public sealed record ContinuityArchiveState
(
    int ReplayArchives,
    int PatternArchives,
    bool ArchiveStable,
    string ArchiveHash
);
