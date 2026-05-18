namespace FOTN.Engine.Myth;

/// <summary>
/// Represents directional narrative pressure acting on myths.
/// </summary>
public readonly record struct NarrativePressure(
    string Source,
    int Magnitude,
    string Theme
);
