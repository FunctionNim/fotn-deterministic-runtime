namespace FOTN.Engine.Resonance;

/// <summary>
/// Tracks accumulated emotional/systemic load inside resonance systems.
/// </summary>
public readonly record struct EmotionalLoad(
    int Stress,
    int Fear,
    int Hope,
    int Stability
);
