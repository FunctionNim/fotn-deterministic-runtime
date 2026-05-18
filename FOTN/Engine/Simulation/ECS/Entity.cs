namespace FOTN.Engine.Simulation.ECS;

/// <summary>
/// Deterministic runtime identity for an entity in the FOTN simulation.
/// Entities carry identity only; data belongs in components and behavior belongs in systems.
/// </summary>
public readonly struct Entity : IEquatable<Entity>
{
    public int Id { get; }

    public Entity(int id)
    {
        if (id < 0)
        {
            throw new ArgumentOutOfRangeException(nameof(id), "Entity id cannot be negative.");
        }

        Id = id;
    }

    public bool Equals(Entity other) => Id == other.Id;

    public override bool Equals(object? obj) => obj is Entity other && Equals(other);

    public override int GetHashCode() => Id;

    public override string ToString() => $"Entity({Id})";
}
