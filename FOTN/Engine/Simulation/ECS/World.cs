namespace FOTN.Engine.Simulation.ECS;

/// <summary>
/// Global deterministic simulation container.
/// Holds systems, entities, and runtime state.
/// </summary>
public sealed class World
{
    private readonly List<ISystem> _systems = new();

    public IReadOnlyList<ISystem> Systems => _systems;

    public void RegisterSystem(ISystem system)
    {
        ArgumentNullException.ThrowIfNull(system);
        _systems.Add(system);
    }

    public void Tick(ulong tick)
    {
        foreach (var system in _systems)
        {
            system.Execute(this, tick);
        }
    }
}
