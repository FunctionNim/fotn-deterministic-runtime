namespace FOTN.Engine.Accord;

public sealed class ContinuityAccordRuntime
{
    public AccordState CreateAccord(
        int participants,
        int accepted
    )
    {
        return new AccordState(
            Guid.NewGuid().ToString(),
            participants,
            accepted,
            accepted >= participants,
            $"ACCORD::{participants}::{accepted}"
        );
    }

    public ReplayLinkState CreateReplayLinks(
        int archives,
        int links
    )
    {
        return new ReplayLinkState(
            archives,
            links,
            links >= archives,
            $"LINK::{archives}::{links}"
        );
    }
}
