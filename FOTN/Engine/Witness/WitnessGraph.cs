namespace FOTN.Engine.Witness;

/// <summary>
/// Graph structure for witness interpretation relationships.
/// </summary>
public sealed class WitnessGraph
{
    private readonly List<WitnessRecord> _records = new();

    public IReadOnlyList<WitnessRecord> Records => _records;

    public void Add(WitnessRecord record)
    {
        _records.Add(record);
    }
}
