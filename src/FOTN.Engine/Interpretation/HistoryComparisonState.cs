namespace FOTN.Engine.Interpretation;

public sealed record HistoryComparisonState
(
    string ComparisonId,
    int LeftPatternCount,
    int RightPatternCount,
    bool Similar,
    string ComparisonHash
);
