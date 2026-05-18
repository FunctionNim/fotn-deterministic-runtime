namespace FOTN.Engine.Simulation.ECS;

/// <summary>
/// Runtime execution unit for deterministic simulation processing.
/// Systems process world state in scheduler-defined order.
/// </summary>
public interface ISystem
{
    string Name { get; }

    void Execute(World world, ulong tick);
}
