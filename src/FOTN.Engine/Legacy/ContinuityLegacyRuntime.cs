namespace FOTN.Engine.Legacy;

public sealed class ContinuityLegacyRuntime
{
    public ContinuityChainState CreateChain(
        string sourceId,
        string targetId,
        long tick
    )
    {
        return new ContinuityChainState(
            Guid.NewGuid().ToString(),
            sourceId,
            targetId,
            tick,
            $"CHAIN::{sourceId}::{targetId}"
        );
    }

    public CivilizationHeritageState CreateHeritage(
        string civilizationId,
        int depth
    )
    {
        return new CivilizationHeritageState(
            civilizationId,
            depth,
            depth > 0,
            $"HERITAGE::{civilizationId}::{depth}"
        );
    }
}
