using FOTN.Engine.Visibility;

namespace FOTN.Engine.Simulation;

public sealed class IntegratedCombatPipeline
{
    private readonly DeterministicInteractionResolver _resolver;
    private readonly PolarityRoutingService _routing;
    private readonly InformationBoxRuntimeService _visibility;

    public IntegratedCombatPipeline(
        DeterministicInteractionResolver resolver,
        PolarityRoutingService routing,
        InformationBoxRuntimeService visibility
    )
    {
        _resolver = resolver;
        _routing = routing;
        _visibility = visibility;
    }

    public EntityMutationResult Execute(
        SimulationEntity source,
        SimulationEntity target,
        InteractionIntent intent
    )
    {
        var resolution = _resolver.Resolve(source, target, intent);

        var remainingBarrier = Math.Max(0, target.Barrier - resolution.DamageApplied);

        var defeated = remainingBarrier <= 0;

        _visibility.Register(
            new HiddenConsequence(
                Guid.NewGuid().ToString(),
                source.EntityId,
                target.EntityId,
                "DAMAGE",
                resolution.DamageApplied,
                intent.Tick,
                false
            )
        );

        return new EntityMutationResult(
            target.EntityId,
            remainingBarrier,
            defeated,
            _routing.Route(defeated),
            resolution.StateHash
        );
    }
}
