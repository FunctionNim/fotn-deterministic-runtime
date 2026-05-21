using FOTN.Engine.Configuration;

namespace FOTN.Engine.Bootstrap;

public sealed class RuntimeBootstrapService
{
    public ContinuityRuntimeOptions CurrentOptions { get; private set; } =
        new(
            "Development",
            true,
            true,
            100
        );

    public void Configure(ContinuityRuntimeOptions options)
    {
        CurrentOptions = options;
    }
}
