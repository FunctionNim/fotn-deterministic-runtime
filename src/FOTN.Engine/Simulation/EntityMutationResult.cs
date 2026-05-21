namespace FOTN.Engine.Simulation;

public sealed record EntityMutationResult
(
    string EntityId,
    int BarrierAfter,
    bool Defeated,
    string DestinationZone,
    string StateHash
);
