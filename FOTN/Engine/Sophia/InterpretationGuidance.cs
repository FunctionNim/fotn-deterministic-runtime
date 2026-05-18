namespace FOTN.Engine.Sophia;

/// <summary>
/// Produces replay-safe interpretive guidance for player readability.
/// </summary>
public sealed class InterpretationGuidance
{
    public string Explain(GuidanceState state)
    {
        return state.RequiresAssistance
            ? "Sophia recommends slowing down and reviewing current pressure states."
            : "Continuity remains stable.";
    }
}
