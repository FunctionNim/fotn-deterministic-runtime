namespace FOTN.Engine.Synthesis;

public sealed record ReplayPatternState
(
    long Tick,
    int PatternsObserved,
    bool Active,
    string PatternHash
);
