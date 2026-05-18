namespace FOTN.Engine.Sacred;

/// <summary>
/// Validates witness convergence requirements for sacred manifestation.
/// </summary>
public static class WitnessThreshold
{
    public static bool HasReached(
        SacredState state,
        int requiredWitnesses)
    {
        return state.WitnessCount >= requiredWitnesses;
    }
}
