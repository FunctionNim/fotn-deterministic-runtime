namespace FOTN.Engine.Reflection;

public sealed class ContinuityReflectionRuntime
{
    public ReflectionEntry CreateEntry(
        long tick,
        string sourceId,
        string summary
    )
    {
        return new ReflectionEntry(
            Guid.NewGuid().ToString(),
            tick,
            sourceId,
            summary,
            $"REFLECT::{tick}::{sourceId}"
        );
    }

    public ReplayReflectionState BuildReplay(
        long tick,
        int frames
    )
    {
        return new ReplayReflectionState(
            tick,
            frames,
            true,
            $"REPLAY::{tick}::{frames}"
        );
    }
}
