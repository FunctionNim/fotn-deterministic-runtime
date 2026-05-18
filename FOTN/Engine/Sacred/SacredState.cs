namespace FOTN.Engine.Sacred;

/// <summary>
/// Deterministic sacred-event state.
/// Sacred systems preserve rarity, witness convergence, and non-farmable manifestation.
/// </summary>
public readonly record struct SacredState(
    int RarityPressure,
    int WitnessCount,
    int AlignmentScore,
    bool HasManifested
);
