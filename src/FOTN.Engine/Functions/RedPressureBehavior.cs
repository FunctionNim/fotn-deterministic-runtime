using FOTN.Engine.Simulation;

namespace FOTN.Engine.Functions;

public sealed class RedPressureBehavior : IFunctionBehavior
{
    public SimulationEntity Apply(
        SimulationEntity entity
    )
    {
        return entity with
        {
            Attack = entity.Attack + 1
        };
    }
}
