namespace FOTN.Engine.Gold;

/// <summary>
/// Controls deterministic visibility and revelation states.
/// </summary>
public sealed class VisibilityLayer
{
    public bool CanReveal(
        ObservationRecord observation,
        bool isRestricted)
    {
        return !isRestricted && !string.IsNullOrWhiteSpace(observation.Pattern);
    }
}
