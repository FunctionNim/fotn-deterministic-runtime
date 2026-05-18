namespace FOTN.Engine.Sophia;

/// <summary>
/// Monitors deterministic survivability pressure on player cognition.
/// </summary>
public sealed class SurvivabilityMonitor
{
    public bool IsAtRisk(GuidanceState state)
    {
        return state.OverloadRisk > 10;
    }
}
