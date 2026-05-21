namespace FOTN.Engine.Interpretation;

public sealed class ContinuityInterpretationRuntime
{
    public HistoryComparisonState Compare(
        int left,
        int right
    )
    {
        return new HistoryComparisonState(
            Guid.NewGuid().ToString(),
            left,
            right,
            Math.Abs(left - right) <= 5,
            $"COMPARE::{left}::{right}"
        );
    }

    public ConvergenceTrendState BuildTrend(
        int convergences,
        int strength
    )
    {
        return new ConvergenceTrendState(
            convergences,
            strength,
            strength > 10,
            $"TREND::{convergences}::{strength}"
        );
    }
}
