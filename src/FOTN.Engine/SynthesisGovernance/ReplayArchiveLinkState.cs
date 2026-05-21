namespace FOTN.Engine.SynthesisGovernance;

public sealed record ReplayArchiveLinkState
(
    int ReplayArchives,
    int LinkedArchives,
    bool Stable,
    string ArchiveHash
);
