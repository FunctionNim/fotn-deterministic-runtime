using FOTN.Engine.Functions;
using FOTN.Engine.Players;

namespace FOTN.Tests;

public sealed class PlayerParticipationRuntimeTests
{
    public void TurnLockRuntime_ShouldLockSelections()
    {
        var runtime = new TurnLockRuntime();

        runtime.Submit(
            new FunctionBoxSelection(
                "PLAYER_001",
                new List<FunctionId>
                {
                    FunctionId.Red,
                    FunctionId.Blue
                },
                false
            )
        );

        if (!runtime.AllLocked())
        {
            throw new Exception("Turn-lock runtime failed.");
        }
    }
}
