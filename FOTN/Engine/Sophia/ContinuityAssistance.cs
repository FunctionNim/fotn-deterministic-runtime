namespace FOTN.Engine.Sophia;

/// <summary>
/// Applies deterministic continuity support for player readability.
/// </summary>
public sealed class ContinuityAssistance
{
    public GuidanceState Stabilize(GuidanceState state)
    {
        return state with
        {
            Clarity = state.Clarity + 1,
            RequiresAssistance = false
        };
    }
}
