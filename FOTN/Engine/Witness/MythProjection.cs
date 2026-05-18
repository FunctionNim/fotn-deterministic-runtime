namespace FOTN.Engine.Witness;

/// <summary>
/// Aggregates witness interpretations into collective narrative states.
/// </summary>
public sealed class MythProjection
{
    public string BuildSummary(IEnumerable<WitnessRecord> records)
    {
        ArgumentNullException.ThrowIfNull(records);

        return string.Join(" :: ", records.Select(r => r.Interpretation));
    }
}
