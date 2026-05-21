using FOTN.Engine.Gameplay;

namespace FOTN.Tests;

public sealed class GameplayLoopRuntimeTests
{
    public void GameplayLoop_ShouldAdvanceStepsAndConvertMomentum()
    {
        var runtime = new GameplayLoopRuntime();

        runtime.AdvanceStep();

        if (runtime.CurrentStep != TurnStep.Upkeep)
        {
            throw new Exception("Turn-step progression failed.");
        }

        runtime.AwardTreasure(5);
        runtime.ConvertTreasureToMomentum();

        if (runtime.CurrentMomentum.Momentum != 5)
        {
            throw new Exception("Momentum conversion failed.");
        }
    }
}
