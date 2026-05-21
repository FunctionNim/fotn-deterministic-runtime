using FOTN.Engine.Queries;

namespace FOTN.Tests;

public sealed class ContinuityQueryTests
{
    public void TimelineQuery_ShouldReturnEntries()
    {
        var service = new InMemoryContinuityQueryService();

        service.Add(
            new TimelineEntry(
                1,
                "EVENT",
                "SYSTEM",
                "Continuity initialized.",
                "HASH"
            )
        );

        var timeline = service.GetTimeline();

        if (timeline.Count != 1)
        {
            throw new Exception("Continuity query failed.");
        }
    }
}
