namespace FOTN.Engine.Resonance;

/// <summary>
/// Represents directional pressure acting on resonance systems.
/// </summary>
public readonly record struct PressureVector(
    string Source,
    int Magnitude,
    string Category
);
