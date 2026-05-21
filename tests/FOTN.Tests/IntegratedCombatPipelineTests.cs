using FOTN.Engine.Simulation;
using FOTN.Engine.Visibility;

namespace FOTN.Tests;

public sealed class IntegratedCombatPipelineTests
{
    public void CombatPipeline_ShouldResolveAndRegisterVisibility()
    {
        var resolver = new DeterministicInteractionResolver();

        var routing = new PolarityRoutingService();

        var visibility = new InformationBoxRuntimeService();

        var pipeline = new IntegratedCombatPipeline(
            resolver,
            routing,
            visibility
        );

        var attacker = new SimulationEntity(
            "AGENT_001",
            SimulationEntityType.Agent,
            "PLAYER_001",
            5,
            1,
            false
        );

        var target = new SimulationEntity(
            "FORTRESS_001",
            SimulationEntityType.Fortress,
            "PLAYER_002",
            0,
            2,
            false
        );

        var result = pipeline.Execute(
            attacker,
            target,
            new InteractionIntent(
                attacker.EntityId,
                target.EntityId,
                "ATTACK",
                1
            )
        );

        if (visibility.Consequences.Count != 1)
        {
            throw new Exception("Visibility registration failed.");
        }

        if (result.BarrierAfter < 0)
        {
            throw new Exception("Barrier mutation failed.");
        }
    }
}
