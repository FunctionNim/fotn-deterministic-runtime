using FOTN.Engine.Orchestration;

namespace FOTN.Engine.Pressure;

public sealed class PressurePropagationService
{
    private readonly IContinuityEventDispatcher _dispatcher;

    public PressurePropagationService(
        IContinuityEventDispatcher dispatcher
    )
    {
        _dispatcher = dispatcher;
    }

    public void Propagate(
        string sourceId,
        string pressureType,
        int pressureValue,
        long tick
    )
    {
        _dispatcher.Dispatch(
            new PressurePropagationEvent(
                Guid.NewGuid(),
                tick,
                "PRESSURE_PROPAGATION",
                sourceId,
                pressureType,
                pressureValue
            )
        );
    }
}
