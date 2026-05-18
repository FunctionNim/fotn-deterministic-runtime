namespace FOTN.Engine.Resonance;

/// <summary>
/// Calculates deterministic resonance drift under sustained pressure.
/// </summary>
public static class DriftCalculation
{
    public static int Calculate(
        ResonanceState state,
        PressureVector vector)
    {
        return state.Drift + vector.Magnitude;
    }
}
