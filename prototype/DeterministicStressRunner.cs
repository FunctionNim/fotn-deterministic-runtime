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
            FullyStable = result.FullyStable
        };
    }
}

public sealed class StressRunResult
{
    public int Iterations { get; init; }

    public int PassedIterations { get; init; }

    public int FailedIterations { get; init; }

    public bool FullyStable { get; init; }
}
