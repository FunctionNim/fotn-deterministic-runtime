namespace FOTN.Engine.Governance;

/// <summary>
/// Canonical immutable runtime truths.
/// If it contradicts Stone, it is invalid.
/// </summary>
public static class ImmutableTruths
{
    public const string EngineLoop =
        "State → Intent → Pipeline → Resolution → Audit → State";

    public const string PlayerLoop =
        "Action → Change → Meaning";

    public const string FlowLaw =
        "No consequence remains isolated.";

    public const string StoneLaw =
        "Stone does not change. Stone enforces limits.";
}
