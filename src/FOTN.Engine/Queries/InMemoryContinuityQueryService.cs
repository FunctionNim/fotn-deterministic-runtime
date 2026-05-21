namespace FOTN.Engine.Queries;

public sealed class InMemoryContinuityQueryService : IContinuityQueryService
{
    private readonly List<TimelineEntry> _entries = new();

    public void Add(TimelineEntry entry)
    {
        _entries.Add(entry);
    }

    public IReadOnlyList<TimelineEntry> GetTimeline()
    {
        return _entries;
    }
}
