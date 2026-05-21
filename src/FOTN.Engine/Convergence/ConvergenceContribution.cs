namespace FOTN.Engine.Convergence;

public sealed record ConvergenceContribution
(
    string ContributorId,
    string ContributionType,
    int AlignmentImpact,
    long Tick
);
