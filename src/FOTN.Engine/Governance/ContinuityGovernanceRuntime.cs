namespace FOTN.Engine.Governance;

public sealed class ContinuityGovernanceRuntime
{
    public ContinuityHealthState EvaluateHealth(
        long tick,
        int stability,
        int pressure
    )
    {
        return new ContinuityHealthState(
            tick,
            stability,
            pressure,
            pressure > stability,
            $"HEALTH::{tick}::{stability}::{pressure}"
        );
    }

    public MetaBalanceState EvaluateMeta(
        int dominant,
        int counter
    )
    {
        return new MetaBalanceState(
            dominant,
            counter,
            dominant <= counter + 5,
            $"META::{dominant}::{counter}"
        );
    }
}
