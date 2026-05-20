using FOTN.Engine.State;

namespace FOTN.Engine.Continuity;

public interface IContinuityAuthority
{
    ContinuitySnapshot Evaluate(
        GameState state,
        ContinuityContext context
    );
}
