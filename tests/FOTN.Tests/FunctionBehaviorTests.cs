using FOTN.Engine.Functions;
using FOTN.Engine.Simulation;

namespace FOTN.Tests;

public sealed class FunctionBehaviorTests
{
    public void RedBehavior_ShouldIncreaseAttack()
    {
        var entity = new SimulationEntity(
            "UNIT_001",
            SimulationEntityType.Agent,
            "PLAYER_001",
            3,
            2,
            false
        );

        var behavior = new RedPressureBehavior();

        var modified = behavior.Apply(entity);

        if (modified.Attack != 4)
        {
            throw new Exception("Red Function behavior failed.");
        }
    }

    public void StoneBehavior_ShouldClampValues()
    {
        var entity = new SimulationEntity(
            "UNIT_002",
            SimulationEntityType.Agent,
            "PLAYER_001",
            50,
            -5,
            false
        );

        var behavior = new StoneLegalityBehavior();

        var modified = behavior.Apply(entity);

        if (modified.Attack > 20 || modified.Barrier < 0)
        {
            throw new Exception("Stone legality behavior failed.");
        }
    }
}
