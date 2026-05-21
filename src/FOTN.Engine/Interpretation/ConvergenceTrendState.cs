namespace FOTN.Engine.Interpretation;

public sealed record ConvergenceTrendState
(
    int ActiveConvergences,
    int TrendStrength,
    bool Escalating,
    string TrendHash
);
