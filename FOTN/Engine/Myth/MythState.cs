namespace FOTN.Engine.Myth;

/// <summary>
/// Deterministic evolving myth state.
/// Myth is preserved as living interpretation, not fixed authority.
/// </summary>
public readonly record struct MythState(
    string MythId,
    string CurrentInterpretation,
    int NarrativeWeight,
    int Drift
);
