using FOTN.Engine.State;

namespace FOTN.Engine.Pressure;

public interface IPressureEngine
{
    PressureState Propagate(
        GameState state,
        PressureEvent pressureEvent
    );
}
