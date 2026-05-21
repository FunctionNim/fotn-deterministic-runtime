using FOTN.Engine.Convergence;

namespace FOTN.Tests;

public sealed class ConvergenceOrchestrationTests
{
    public void Convergence_ShouldAdvancePhases()
    {
        var orchestration = new ConvergenceOrchestrationService();

        orchestration.Contribute(
            new ConvergenceContribution(
                "PLAYER_001",
                "RITUAL",
                15,
                100
            )
        );

        if (orchestration.CurrentState.Phase == ConvergencePhase.Dormant)
        {
            throw new Exception("Convergence phase failed to advance.");
        }
    }
}
