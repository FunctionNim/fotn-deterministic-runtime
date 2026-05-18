namespace FOTN.Engine.Corruption;

/// <summary>
/// Deterministic corruption state representing instability pressure.
/// Corruption is tracked as pressure, not assumed moral failure.
/// </summary>
public readonly record struct CorruptionState(
    int Entropy,
    int MeaningLoss,
    int IdentityInstability,
    bool IsContained
);
