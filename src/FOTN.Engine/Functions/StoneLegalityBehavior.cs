using FOTN.Engine.Simulation;

namespace FOTN.Engine.Functions;

public sealed class StoneLegalityBehavior : IFunctionBehavior
{
    public SimulationEntity Apply(
        SimulationEntity entity
    )
    {
        var attack = Math.Clamp(entity.Attack, 0, 20);
        var barrier = Math.Clamp(entity.Barrier, 0, 20);

        return entity with
        {
            Attack = attack,
            Barrier = barrier
        };
    }
}
