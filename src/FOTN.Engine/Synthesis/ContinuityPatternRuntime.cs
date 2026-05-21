namespace FOTN.Engine.Synthesis;

public sealed class ContinuityPatternRuntime
{
    public SynthesisPattern CreatePattern(
        string sourceId,
        int strength
    )
    {
        return new SynthesisPattern(
            Guid.NewGuid().ToString(),
            sourceId,
            strength,
            $"PATTERN::{sourceId}::{strength}"
        );
    }

    public ReplayPatternState BuildReplay(
        long tick,
        int patterns
    )
    {
        return new ReplayPatternState(
            tick,
            patterns,
            true,
            $"REPLAY::{tick}::{patterns}"
        );
    }
}
