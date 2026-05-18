namespace FOTN.Continuity.Sophia;

/// <summary>
/// Produces player-facing interpretation guidance from continuity systems.
/// Sophia explains pressure, survivability, and consequence without replacing player agency.
/// </summary>
public sealed class SophiaInterpretationService
{
    public string CreateGuidance(
        string topic,
        string interpretation)
    {
        return $"{topic}: {interpretation}";
    }
}
