using FOTN.Engine.Simulation;

namespace FOTN.Engine.Functions;

public interface IFunctionBehavior
{
    SimulationEntity Apply(
        SimulationEntity entity
    );
}
