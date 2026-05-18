namespace FOTN.Engine.Gold;

/// <summary>
/// Detects recurring deterministic structures and behavioral patterns.
/// </summary>
public sealed class PatternRecognition
{
    public bool Recognize(
        ObservationRecord observation,
        string expectedPattern)
    {
        return observation.Pattern == expectedPattern;
    }
}
