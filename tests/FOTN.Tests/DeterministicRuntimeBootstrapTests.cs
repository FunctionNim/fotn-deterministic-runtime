using FOTN.Engine.Runtime;

namespace FOTN.Tests;

public sealed class DeterministicRuntimeBootstrapTests
{
    public void RuntimeCore_ShouldAcceptIntent()
    {
        var runtime = new DeterministicRuntimeCore();

        var result = runtime.Execute(
            new Intent(
                Guid.NewGuid(),
                "PLAYER_001",
                "BOOTSTRAP_TEST",
                Array.Empty<string>(),
                new Dictionary<string, string>(),
                0
            )
        );

        if (!result.Success)
        {
            throw new Exception("Deterministic runtime bootstrap failed.");
        }
    }
}
