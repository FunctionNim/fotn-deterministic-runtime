namespace FOTN.Engine.Convergence;

public sealed class ConvergenceOrchestrationService
{
    private readonly List<ConvergenceContribution> _contributions = new();

    public IReadOnlyList<ConvergenceContribution> Contributions => _contributions;

    public ConvergenceAlignmentState CurrentState { get; private set; } =
        new(
            Tick: 0,
            Phase: ConvergencePhase.Dormant,
            AlignmentValue: 0,
            ContributionCount: 0,
            StateHash: "CONVERGENCE_PENDING"
        );

    public void Contribute(ConvergenceContribution contribution)
    {
        _contributions.Add(contribution);

        var totalAlignment = _contributions.Sum(x => x.AlignmentImpact);

        var phase = totalAlignment switch
        {
            < 10 => ConvergencePhase.Emergence,
            < 25 => ConvergencePhase.Preparation,
            < 50 => ConvergencePhase.Synchronization,
            < 100 => ConvergencePhase.Climax,
            _ => ConvergencePhase.Resolution
        };

        CurrentState = new ConvergenceAlignmentState(
            Tick: contribution.Tick,
            Phase: phase,
            AlignmentValue: totalAlignment,
            ContributionCount: _contributions.Count,
            StateHash: $"ALIGN::{totalAlignment}::{phase}"
        );
    }
}
