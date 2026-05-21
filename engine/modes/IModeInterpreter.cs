using FOTN.Engine.Pressure;
using FOTN.Engine.Runtime;
using FOTN.Engine.State;

namespace FOTN.Engine.Modes;

public interface IModeInterpreter
{
    ModeSnapshot Interpret(
        GameState state,
        RuntimeAction action,
        PressureState pressureState,
        ModeContext context
    );
}
