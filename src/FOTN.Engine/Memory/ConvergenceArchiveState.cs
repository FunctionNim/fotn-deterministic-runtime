namespace FOTN.Engine.Memory;

public sealed record ConvergenceArchiveState
(
    int ActiveArchives,
    int ConsolidatedPatterns,
    bool Stable,
    string ArchiveHash
);
