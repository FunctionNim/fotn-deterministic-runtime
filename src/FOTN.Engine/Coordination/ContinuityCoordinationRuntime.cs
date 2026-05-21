namespace FOTN.Engine.Coordination;

public sealed class ContinuityCoordinationRuntime
{
    public ContinuityLinkState CreateLink(
        string sourceId,
        string targetId
    )
    {
        return new ContinuityLinkState(
            Guid.NewGuid().ToString(),
            sourceId,
            targetId,
            true,
            $"LINK::{sourceId}::{targetId}"
        );
    }

    public RegionLinkState BuildRegionLinks(
        int regions,
        int paths
    )
    {
        return new RegionLinkState(
            regions,
            paths,
            paths >= regions,
            $"REGION::{regions}::{paths}"
        );
    }
}
