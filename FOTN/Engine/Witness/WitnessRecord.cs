namespace FOTN.Engine.Witness;

/// <summary>
/// A deterministic record of witnessed runtime meaning.
/// Witness records preserve attribution without finalizing truth alone.
/// </summary>
public readonly record struct WitnessRecord(
    string WitnessId,
    string EventId,
    string Interpretation,
    ulong Tick
);
