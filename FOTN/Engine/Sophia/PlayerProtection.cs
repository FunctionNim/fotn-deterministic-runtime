namespace FOTN.Engine.Sophia;

/// <summary>
/// Applies survivability-oriented player protection rules.
/// Protection preserves continuity without removing consequence.
/// </summary>
public sealed class PlayerProtection
{
    public bool ShouldIntervene(GuidanceState state)
    {
        return state.RequiresAssistance
            && state.OverloadRisk > 15;
    }
}
