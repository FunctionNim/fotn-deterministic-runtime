namespace FOTN.Engine.Queries;

public sealed class TimelineReadService
{
    private readonly IContinuityQueryService _queryService;

    public TimelineReadService(
        IContinuityQueryService queryService
    )
    {
        _queryService = queryService;
    }

    public IReadOnlyList<TimelineEntry> ReadTimeline()
    {
        return _queryService.GetTimeline();
    }
}
