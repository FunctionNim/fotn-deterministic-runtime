using FOTN.Engine.State;

namespace FOTN.Prototype;

public sealed class DeterministicMatchValidationRunner
{
    private readonly MultiTurnMatchSimulation _simulation = new();

    public DeterministicMatchValidationResult Validate()
    {
        var firstRun = _simulation.Run();
        var secondRun = _simulation.Run();

        return new DeterministicMatchValidationResult
        {
            FirstRunOutput = firstRun,
            SecondRunOutput = secondRun,
            Matches = firstRun == secondRun
        };
    }
}

public sealed class DeterministicMatchValidationResult
{
    public string FirstRunOutput { get; init; } = string.Empty;

    public string SecondRunOutput { get; init; } = string.Empty;

    public bool Matches { get; init; }
}
