using FOTN.Engine.Visibility;

namespace FOTN.Tests;

public sealed class InformationVisibilityTests
{
    public void InformationBox_ShouldAuthorizeReveal()
    {
        var runtime = new InformationBoxRuntimeService();

        runtime.Register(
            new HiddenConsequence(
                "CONS_001",
                "AGENT_001",
                "FORTRESS_001",
                "DAMAGE",
                3,
                1,
                false
            )
        );

        var reveal = runtime.Reveal(1);

        if (!reveal.RevealAuthorized)
        {
            throw new Exception("Information reveal authorization failed.");
        }
    }
}
