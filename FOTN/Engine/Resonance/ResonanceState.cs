namespace FOTN.Engine.Resonance;

/// <summary>
/// Deterministic resonance state for social, emotional, and systemic pressure.
/// </summary>
public readonly record struct ResonanceState(
    int Alignment,
    int Trust,
    int Contradiction,
    int Drift
);
