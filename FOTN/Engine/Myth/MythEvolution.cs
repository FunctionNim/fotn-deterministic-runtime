namespace FOTN.Engine.Myth;

/// <summary>
/// Evolves myth states under sustained narrative pressure.
/// </summary>
public sealed class MythEvolution
{
    public MythState Evolve(
        MythState state,
        NarrativePressure pressure)
    {
        return state with
        {
            NarrativeWeight = state.NarrativeWeight + pressure.Magnitude,
            Drift = state.Drift + 1
        };
    }
}
