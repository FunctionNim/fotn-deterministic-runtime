namespace FOTN.Engine.Gold;

/// <summary>
/// Produces replay-safe interpretive summaries from observed runtime patterns.
/// </summary>
public sealed class GoldInterpretation
{
    public string Interpret(ObservationRecord observation)
    {
        return $"Observed pattern: {observation.Pattern}";
    }
}
