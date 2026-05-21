using FOTN.Engine.World;

namespace FOTN.Tests;

public sealed class WorldOrchestrationTests
{
    public void WorldService_ShouldRegisterWorldStructures()
    {
        var service = new WorldOrchestrationService();

        service.RegisterDistrict(
            new DistrictState(
                "DISTRICT_001",
                "BLUE",
                5,
                10,
                1
            )
        );

        service.RegisterRoute(
            new RouteConnection(
                "DISTRICT_001",
                "DISTRICT_002",
                3,
                true
            )
        );

        service.RegisterNode(
            new ResonanceNode(
                "NODE_001",
                "HARMONY",
                7,
                true
            )
        );

        if (service.Districts.Count != 1 || service.Routes.Count != 1 || service.Nodes.Count != 1)
        {
            throw new Exception("World orchestration registration failed.");
        }
    }
}
