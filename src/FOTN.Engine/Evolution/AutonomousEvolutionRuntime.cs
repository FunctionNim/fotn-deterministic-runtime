namespace FOTN.Engine.Evolution;

public sealed class AutonomousEvolutionRuntime
{
    public EvolutionTickState Advance(
        long tick,
        int civilizations,
        int districts
    )
    {
        var drift = civilizations + districts;

        return new EvolutionTickState(
            tick,
            civilizations,
            districts,
            drift,
            $"EVOLVE::{tick}::{drift}"
        );
    }

    public RegionChangeState CreateRegionChange(
        string regionId,
        int level
    )
    {
        return new RegionChangeState(
            regionId,
            level,
            true,
            $"REGION::{regionId}::{level}"
        );
    }
}
