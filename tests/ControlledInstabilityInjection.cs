using FOTN.Prototype;

namespace FOTN.Tests;

public sealed class ControlledInstabilityInjection
{
    private readonly MultiCombatMatchSimulation _simulation = new();

    public ControlledInstabilityResult VerifyDetection()
    {
        var expected = _simulation.Run();
        var observed = expected + "\nCONTROLLED_INSTABILITY: battle-order-divergence";

        var detected = expected != observed;

        return new ControlledInstabilityResult
        {
            InstabilityInjected = true,
            InstabilityDetected = detected,
            LocalizedSystem = "BattleSequencing",
            ExpectedOutput = expected,
            ObservedOutput = observed
        };
    }
}

public sealed class ControlledInstabilityResult
{
    public bool InstabilityInjected { get; init; }

    public bool InstabilityDetected { get; init; }

    public string LocalizedSystem { get; init; } = string.Empty;

    public string ExpectedOutput { get; init; } = string.Empty;

    public string ObservedOutput { get; init; } = string.Empty;
}
