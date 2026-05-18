namespace FOTN.Engine.Corruption;

/// <summary>
/// Models deterministic identity fragmentation under systemic instability.
/// </summary>
public sealed class IdentityFracture
{
    public CorruptionState Fracture(CorruptionState state)
    {
        return state with
        {
            IdentityInstability = state.IdentityInstability + 1
        };
    }
}
