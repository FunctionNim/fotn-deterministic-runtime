namespace FOTN.Engine.SynthesisGovernance;

public sealed record ConvergenceArchiveState
(
    int ActiveConvergences,
    int ConsolidatedArchives,
    bool Stable,
    string ArchiveHash
);
