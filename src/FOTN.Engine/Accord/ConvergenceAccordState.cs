namespace FOTN.Engine.Accord;

public sealed record ConvergenceAccordState
(
    int ActiveConvergences,
    int StableRegions,
    bool Stable,
    string AccordHash
);
