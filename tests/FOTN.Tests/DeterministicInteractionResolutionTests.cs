using FOTN.Engine.Simulation;

namespace FOTN.Tests;

public sealed class DeterministicInteractionResolutionTests
{
    public void InteractionResolver_ShouldResolveDeterministically()
    {
        var source = new SimulationEntity(
            "AGENT_001",
            SimulationEntityType.Agent,
            "PLAYER_001",
            5,
            2,
            false
        );

        var target = new SimulationEntity(
            "FORTRESS_001",
            SimulationEntityType.Fortress,
            "PLAYER_002",
            0,
            3,
            false
        );

        var intent = new InteractionIntent(
            source.EntityId,
            target.EntityId,
            "ATTACK",
            1
        );

        var resolver = new DeterministicInteractionResolver();

        var result = resolver.Resolve(source, target, intent);

        if (!result.Success)
        {
            throw new Exception("Deterministic interaction resolution failed.");
        }
    }
}
