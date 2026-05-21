using FOTN.Engine.Simulation;

namespace FOTN.Engine.Functions;

public sealed class GoldObservabilityBehavior : IFunctionBehavior
{
    public SimulationEntity Apply(
        SimulationEntity entity
    )
    {
        return entity;
    }
}
