using FOTN.Tests;

namespace FOTN.Prototype;

public sealed class DeterministicStressRunner
{
    private readonly ReplayConsistencyAutomation _automation = new();
    private readonly ReplayFrameOrderingVerification _replayOrdering = new();
    private readonly AuditOrderingVerification _auditOrdering = new();
    private readonly MutationOrderingVerification _mutationOrdering = new();
    private readonly RepeatedBattleSequencingVerification _battleOrdering = new();
    private readonly ReplayReconstructionVerification _reconstruction = new();

    public StressRunResult Execute(int iterations)
    {
        var replay = _automation.Execute(iterations);
        var replayOrdering = _replayOrdering.Verify();
        var auditOrdering = _auditOrdering.Verify();
        var mutationOrdering = _mutationOrdering.Verify();
        var battleOrdering = _battleOrdering.Verify(iterations);
        var reconstruction = _reconstruction.Verify();

        var stable = replay.FullyStable &&
                     replayOrdering.ReplayFrameOrdered &&
                     auditOrdering.AuditTickOrdered &&
                     mutationOrdering.MutationOrdered &&
                     battleOrdering.Stable &&
                     reconstruction.ReconstructionSucceeded;

        return new StressRunResult
        {
            Iterations = iterations,
            PassedIterations = replay.PassedIterations,
            FailedIterations = replay.FailedIterations,
            FullyStable = stable,
            ReplayFrameOrderingStable = replayOrdering.ReplayFrameOrdered,
            AuditOrderingStable = auditOrdering.AuditTickOrdered,
            MutationOrderingStable = mutationOrdering.MutationOrdered,
            BattleOrderingStable = battleOrdering.Stable,
            ReplayReconstructionStable = reconstruction.ReconstructionSucceeded,
            Summary = BuildSummary(iterations, replay.PassedIterations, replay.FailedIterations, stable)
        };
    }

    public IReadOnlyCollection<StressRunResult> ExecutePresetSequence()
    {
        return new[]
        {
            Execute(10),
            Execute(25),
            Execute(50),
            Execute(100)
        };
    }

    private static string BuildSummary(
        int iterations,
        int passed,
        int failed,
        bool stable)
    {
        return $"Stress Run | Iterations: {iterations} | Passed: {passed} | Failed: {failed} | Stable: {stable}";
    }
}

public sealed class StressRunResult
{
    public int Iterations { get; init; }

    public int PassedIterations { get; init; }

    public int FailedIterations { get; init; }

    public bool FullyStable { get; init; }

    public bool ReplayFrameOrderingStable { get; init; }

    public bool AuditOrderingStable { get; init; }

    public bool MutationOrderingStable { get; init; }

    public bool BattleOrderingStable { get; init; }

    public bool ReplayReconstructionStable { get; init; }

    public string Summary { get; init; } = string.Empty;
}
