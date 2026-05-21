namespace FOTN.Engine.Convergence;

public sealed record ConvergenceAlignmentState
(
    long Tick,
    ConvergencePhase Phase,
    int AlignmentValue,
    int ContributionCount,
    string StateHash
);
