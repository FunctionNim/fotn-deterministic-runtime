using FOTN.Prototype;

namespace FOTN.Tests;

public sealed class ReplayConsistencyAutomation
{
    private readonly ReplayRegressionSuite _suite = new();

    public ReplayAutomationResult Execute(int iterations)
    {
        var passed = 0;
        var failed = 0;

        for (var i = 0; i < iterations; i++)
        {
            var result = _suite.Run();

            if (result.Passed)
            {
                passed++;
            }
            else
            {
                failed++;
            }
        }

        return new ReplayAutomationResult
        {
            PassedIterations = passed,
            FailedIterations = failed,
            FullyStable = failed == 0
        };
    }
}

public sealed class ReplayAutomationResult
{
    public int PassedIterations { get; init; }

    public int FailedIterations { get; init; }

    public bool FullyStable { get; init; }
}
