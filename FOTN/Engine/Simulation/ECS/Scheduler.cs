namespace FOTN.Engine.Simulation.ECS;

/// <summary>
/// Deterministic scheduler controlling simulation tick progression.
/// All runtime systems execute in stable ordered sequence.
/// </summary>
public sealed class Scheduler
{
    public ulong CurrentTick { get; private set; }

    public void Advance(World world)
    {
        ArgumentNullException.ThrowIfNull(world);

        world.Tick(CurrentTick);
        CurrentTick++;
    }
}
