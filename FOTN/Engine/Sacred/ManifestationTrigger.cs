namespace FOTN.Engine.Sacred;

/// <summary>
/// Evaluates deterministic sacred manifestation conditions.
/// </summary>
public sealed class ManifestationTrigger
{
    public bool CanManifest(SacredState state)
    {
        return state.RarityPressure > 0
            && state.WitnessCount > 0
            && !state.HasManifested;
    }
}
