using FOTN.Engine.Resolution;

namespace FOTN.Tests;

public sealed class CanonicalResolutionRuntimeTests
{
    public void ResolutionRuntime_ShouldOrderBattlesDeterministically()
    {
        var runtime = new CanonicalResolutionRuntime();

        var ordered = runtime.OrderBattles(
            new List<BattleDeclaration>
            {
                new("A","T",2,2),
                new("B","T",1,1)
            }
        );

        if (ordered[0].AttackerId != "B")
        {
            throw new Exception("Battle ordering failed.");
        }
    }

    public void ResolutionRuntime_ShouldDetectVictory()
    {
        var runtime = new CanonicalResolutionRuntime();

        var result = runtime.ResolveTreasure(
            "PLAYER_001",
            5,
            26
        );

        if (!result.VictoryReached)
        {
            throw new Exception("Victory resolution failed.");
        }
    }
}
