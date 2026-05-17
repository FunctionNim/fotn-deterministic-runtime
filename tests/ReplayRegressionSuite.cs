using FOTN.Engine.State;
using FOTN.Prototype;

namespace FOTN.Tests;

public sealed class ReplayRegressionSuite
{
    private readonly DeterministicMatchValidationRunner _validation = new();
    private readonly RuntimeHashComparisonTest _hashTest = new();

    public ReplayRegressionResult Run()
    {
        var validationResult = _validation.Validate();
        var hashResult = _hashTest.Validate();

        return new ReplayRegressionResult
        {
            ReplayOutputsMatch = validationResult.Matches,
            RuntimeHashesMatch = hashResult,
            Passed = validationResult.Matches && hashResult
        };
    }
}

public sealed class ReplayRegressionResult
{
    public bool ReplayOutputsMatch { get; init; }

    public bool RuntimeHashesMatch { get; init; }

    public bool Passed { get; init; }
}
