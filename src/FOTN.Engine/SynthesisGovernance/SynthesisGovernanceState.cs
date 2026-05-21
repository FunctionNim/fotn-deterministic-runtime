namespace FOTN.Engine.SynthesisGovernance;

public sealed record SynthesisGovernanceState
(
    int ArchiveCount,
    int HeritageCount,
    int PatternCount,
    bool Stable,
    string StateHash
);
