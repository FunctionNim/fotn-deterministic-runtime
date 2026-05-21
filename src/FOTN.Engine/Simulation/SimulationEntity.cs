namespace FOTN.Engine.Simulation;

public sealed record SimulationEntity
(
    string EntityId,
    SimulationEntityType EntityType,
    string OwnerId,
    int Attack,
    int Barrier,
    bool Exhausted
);
