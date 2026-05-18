namespace FOTN.Engine.Witness;

/// <summary>
/// Processes witness meaning into replay-safe interpretive continuity.
/// </summary>
public sealed class InterpretationLayer
{
    public WitnessRecord Interpret(
        string witnessId,
        string eventId,
        string interpretation,
        ulong tick)
    {
        return new WitnessRecord(
            witnessId,
            eventId,
            interpretation,
            tick);
    }
}
