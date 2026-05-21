namespace VisualContinuityClient.Presentation;

public sealed class ContinuityPresentationRuntime
{
    public PresentationEvent CreateEvent(
        string eventType,
        string targetId,
        long tick
    )
    {
        return new PresentationEvent(
            Guid.NewGuid().ToString(),
            eventType,
            tick,
            targetId,
            $"PRESENT::{eventType}::{tick}"
        );
    }

    public ZoneUpdateFrame BuildZoneUpdate(
        string zoneId,
        int entities
    )
    {
        return new ZoneUpdateFrame(
            zoneId,
            entities,
            true,
            $"ZONE::{zoneId}::{entities}"
        );
    }
}
