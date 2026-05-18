namespace FOTN.Engine.Sophia;

/// <summary>
/// Deterministic Sophia guidance state for player-facing survivability support.
/// Sophia guides and clarifies; she does not remove pressure.
/// </summary>
public readonly record struct GuidanceState(
    string PlayerId,
    int Clarity,
    int OverloadRisk,
    bool RequiresAssistance
);
