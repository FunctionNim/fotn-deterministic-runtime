using FOTN.Tests;

namespace FOTN.Prototype;

public sealed class DeterministicStressRunner
{
    private readonly ReplayConsistencyAutomation _automation = new();

    public StressRunResult Execute(int iterations)
    {
        var result = _automation.Execute(iterations);

        return new StressRunResult
        {
            Iterations = iterations,
            PassedIterations = result.PassedIterations,
            FailedIterations = result.FailedIterations,
            FullyStable = result.FullyStable,
            Summary = BuildSummary(iterations, result.PassedIterations, result.FailedIterations, result.FullyStable)
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

    public string Summary { get; init; } = string.Empty;
}
