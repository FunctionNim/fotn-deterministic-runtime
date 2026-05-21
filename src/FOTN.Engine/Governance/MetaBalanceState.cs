namespace FOTN.Engine.Governance;

public sealed record MetaBalanceState
(
    int DominantPressure,
    int CounterPressure,
    bool Stable,
    string BalanceHash
);
