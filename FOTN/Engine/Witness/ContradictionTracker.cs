namespace FOTN.Engine.Witness;

/// <summary>
/// Tracks conflicting interpretations without erasing them.
/// Contradictions are preserved as pressure, not treated as corruption automatically.
/// </summary>
public sealed class ContradictionTracker
{
    private readonly List<(WitnessRecord A, WitnessRecord B)> _contradictions = new();

    public IReadOnlyList<(WitnessRecord A, WitnessRecord B)> Contradictions
        => _contradictions;

    public void Register(WitnessRecord a, WitnessRecord b)
    {
        _contradictions.Add((a, b));
    }
}
