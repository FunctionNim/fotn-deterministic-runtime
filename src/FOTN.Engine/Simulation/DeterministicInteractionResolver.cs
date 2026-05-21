namespace FOTN.Engine.Simulation;

public sealed class DeterministicInteractionResolver
{
    public InteractionResolution Resolve(
        SimulationEntity source,
        SimulationEntity target,
        InteractionIntent intent
    )
    {
        var damage = Math.Max(0, source.Attack - target.Barrier);

        return new InteractionResolution(
            Success: true,
            Outcome: $"{source.EntityId} resolved {intent.InteractionType} against {target.EntityId}.",
            DamageApplied: damage,
            StateHash: $"INTERACTION::{source.EntityId}::{target.EntityId}::{damage}"
        );
    }
}
