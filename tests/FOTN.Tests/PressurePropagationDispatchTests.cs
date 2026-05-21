using FOTN.Engine.Orchestration;
using FOTN.Engine.Pressure;

namespace FOTN.Tests;

public sealed class PressurePropagationDispatchTests
{
    public void PressureService_ShouldDispatchEvents()
    {
        var dispatcher = new DeterministicContinuityEventDispatcher();

        var service = new PressurePropagationService(dispatcher);

        service.Propagate(
            "DISTRICT_001",
            "SCARCITY",
            3,
            10
        );

        if (dispatcher.DispatchedEvents.Count != 1)
        {
            throw new Exception("Pressure propagation dispatch failed.");
        }
    }
}
