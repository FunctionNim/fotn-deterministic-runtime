namespace FOTN.Engine.Sacred;

/// <summary>
/// Preserves sacred rarity and prevents deterministic exploitation.
/// </summary>
public static class SacredRarity
{
    public static bool Validate(SacredState state)
    {
        return state.RarityPressure <= 13
            && state.AlignmentScore >= 0;
    }
}
