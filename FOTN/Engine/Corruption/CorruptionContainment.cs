namespace FOTN.Engine.Corruption;

/// <summary>
/// Applies containment logic to unstable corruption states.
/// Containment reduces propagation without deleting history.
/// </summary>
public sealed class CorruptionContainment
{
    public CorruptionState Contain(CorruptionState state)
    {
        return state with
        {
            IsContained = true
        };
    }
}
