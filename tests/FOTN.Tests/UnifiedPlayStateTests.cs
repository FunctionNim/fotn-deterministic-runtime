using FOTN.Engine.Functions;
using FOTN.Engine.Players;
using FOTN.Engine.Simulation;
using FOTN.Engine.State;

namespace FOTN.Tests;

public sealed class UnifiedPlayStateTests
{
    public void UnifiedState_ShouldContainPlayersEntitiesAndZones()
    {
        var state = new UnifiedPlayState(
            Guid.NewGuid(),
            1,
            new List<PlayerContinuityProfile>
            {
                new(
                    "PLAYER_001",
                    "Aaron",
                    FunctionId.Red,
                    0,
                    true
                )
            },
            new List<SimulationEntity>
            {
                new(
                    "ENTITY_001",
                    SimulationEntityType.Agent,
                    "PLAYER_001",
                    3,
                    2,
                    false
                )
            },
            new List<ZoneOccupancy>
            {
                new(
                    "PUBLIC",
                    "PLAYER_001",
                    new List<string>
                    {
                        "ENTITY_001"
                    }
                )
            },
            "HASH"
        );

        if (state.Players.Count != 1 || state.Entities.Count != 1 || state.Zones.Count != 1)
        {
            throw new Exception("Unified play-state composition failed.");
        }
    }
}
