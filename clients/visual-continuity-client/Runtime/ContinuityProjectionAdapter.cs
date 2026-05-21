using FOTN.Engine.Interface;

namespace VisualContinuityClient.Runtime;

public sealed class ContinuityProjectionAdapter
{
    public RenderFrameState AdaptReplay(
        ReplayTimelineViewState replay
    )
    {
        return new RenderFrameState(
            replay.CurrentTick,
            replay.StateHash,
            true,
            $"Replay Tick {replay.CurrentTick}"
        );
    }
}
