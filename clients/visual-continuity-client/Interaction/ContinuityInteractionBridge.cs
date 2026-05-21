namespace VisualContinuityClient.Interaction;

public sealed class ContinuityInteractionBridge
{
    public BoardInteractionIntent CreateZoneInteraction(
        string playerId,
        string zoneId,
        long tick
    )
    {
        return new BoardInteractionIntent(
            playerId,
            zoneId,
            "SELECT_ZONE",
            tick
        );
    }

    public ReplayScrubberState CreateReplayState(
        long tick,
        long maxTick
    )
    {
        return new ReplayScrubberState(
            tick,
            maxTick,
            false,
            $"SCRUB::{tick}::{maxTick}"
        );
    }
}
