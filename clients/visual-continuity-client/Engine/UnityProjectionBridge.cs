using VisualContinuityClient.Interface;
using VisualContinuityClient.Runtime;

namespace VisualContinuityClient.Engine;

public sealed class UnityProjectionBridge
{
    public BoardSceneState BuildBoard(
        RenderFrameState frame,
        int zones,
        int players
    )
    {
        return new BoardSceneState(
            zones,
            players,
            true,
            frame.StateHash
        );
    }

    public ReplayTimelineRendererState BuildReplay(
        ReplayViewerState replay
    )
    {
        return new ReplayTimelineRendererState(
            replay.CurrentTick,
            replay.TotalFrames,
            replay.Playing,
            replay.StateHash
        );
    }
}
