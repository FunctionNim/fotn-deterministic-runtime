namespace FOTN.Engine.Queries;

public interface IContinuityQueryService
{
    IReadOnlyList<TimelineEntry> GetTimeline();
}
