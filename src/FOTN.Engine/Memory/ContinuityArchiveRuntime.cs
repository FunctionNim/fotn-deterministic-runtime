namespace FOTN.Engine.Memory;

public sealed class ContinuityArchiveRuntime
{
    public ContinuityRecordState CreateRecord(
        long tick,
        int archives,
        int patterns
    )
    {
        return new ContinuityRecordState(
            Guid.NewGuid().ToString(),
            tick,
            archives,
            patterns,
            $"RECORD::{tick}::{archives}::{patterns}"
        );
    }

    public ReplayArchiveRecord CreateReplay(
        int frames
    )
    {
        return new ReplayArchiveRecord(
            Guid.NewGuid().ToString(),
            frames,
            true,
            $"ARCHIVE::{frames}"
        );
    }
}
