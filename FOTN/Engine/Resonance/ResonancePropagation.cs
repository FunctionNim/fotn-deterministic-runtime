namespace FOTN.Engine.Resonance;

/// <summary>
/// Propagates resonance pressure through connected systems.
/// </summary>
public sealed class ResonancePropagation
{
    public ResonanceState Apply(
        ResonanceState state,
        PressureVector vector)
    {
        return state with
        {
            Drift = DriftCalculation.Calculate(state, vector)
        };
    }
}
