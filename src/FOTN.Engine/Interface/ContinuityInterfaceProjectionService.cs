namespace FOTN.Engine.Interface;

public sealed class ContinuityInterfaceProjectionService
{
    public ZoneViewState BuildZone(
        string zoneId,
        int entityCount
    )
    {
        return new ZoneViewState(
            zoneId,
            zoneId,
            entityCount,
            true
        );
    }

    public ReplayTimelineViewState BuildReplay(
        long tick,
        int frames
    )
    {
        return new ReplayTimelineViewState(
            tick,
            frames,
            true,
            $"REPLAY::{tick}::{frames}"
        );
    }
}
