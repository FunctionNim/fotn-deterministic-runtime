namespace FOTN.Engine.Gold;

/// <summary>
/// Deterministic observation record for Gold-layer runtime visibility.
/// Gold observes and interprets; it does not directly enforce outcomes.
/// </summary>
public readonly record struct ObservationRecord(
    string ObserverId,
    string TargetId,
    string Pattern,
    ulong Tick
);
