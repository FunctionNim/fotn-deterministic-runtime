using FOTN.Prototype;

namespace FOTN.Tests;

public sealed class RepeatedBattleSequencingVerification
{
    private readonly MultiCombatMatchSimulation _simulation = new();

    public BattleSequencingResult Verify(int iterations)
    {
        string? baseline = null;
        var passed = 0;
        var failed = 0;

        for (var i = 0; i < iterations; i++)
        {
            var result = _simulation.Run();

            baseline ??= result;

            if (result == baseline)
            {
                passed++;
            }
            else
            {
                failed++;
            }
        }

        return new BattleSequencingResult
        {
            Iterations = iterations,
            PassedIterations = passed,
            FailedIterations = failed,
            Stable = failed == 0
        };
    }
}

public sealed class BattleSequencingResult
{
    public int Iterations { get; init; }

    public int PassedIterations { get; init; }

    public int FailedIterations { get; init; }

    public bool Stable { get; init; }
}
