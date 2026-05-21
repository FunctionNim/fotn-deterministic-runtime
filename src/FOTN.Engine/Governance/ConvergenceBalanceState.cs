namespace FOTN.Engine.Governance;

public sealed record ConvergenceBalanceState
(
    int ActiveConvergences,
    int NormalizedRegions,
    bool Balanced,
    string BalanceHash
);
