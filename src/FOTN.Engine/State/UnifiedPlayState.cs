using FOTN.Engine.Players;
using FOTN.Engine.Simulation;

namespace FOTN.Engine.State;

public sealed record UnifiedPlayState
(
    Guid MatchId,
    long Tick,
    IReadOnlyList<PlayerContinuityProfile> Players,
    IReadOnlyList<SimulationEntity> Entities,
    IReadOnlyList<ZoneOccupancy> Zones,
    string StateHash
);
