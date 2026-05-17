using FOTN.Engine.State;
using FOTN.Prototype;

namespace FOTN.Tests;

public sealed class DeterministicMutationComparison
{
    private readonly MultiCombatMatchSimulation _simulation = new();

    public MutationComparisonResult Compare()
    {
        var first = _simulation.Run();
        var second = _simulation.Run();

        return new MutationComparisonResult
        {
            FirstResult = first,
            SecondResult = second,
            Matches = first == second
        };
    }
}

public sealed class MutationComparisonResult
{
    public string FirstResult { get; init; } = string.Empty;

    public string SecondResult { get; init; } = string.Empty;

    public bool Matches { get; init; }
}
