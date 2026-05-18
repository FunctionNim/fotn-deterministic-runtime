namespace FOTN.Engine.Corruption;

/// <summary>
/// Propagates deterministic entropy pressure through unstable systems.
/// </summary>
public sealed class EntropyPropagation
{
    public CorruptionState Apply(
        CorruptionState state,
        int entropyDelta)
    {
        return state with
        {
            Entropy = state.Entropy + entropyDelta
        };
    }
}
