using VisualContinuityClient.Interface;
using VisualContinuityClient.Runtime;

namespace VisualContinuityClient.Prototype;

public sealed class LocalPrototypeRuntime
{
    public RenderFrameState CreateReplayFrame(
        long tick
    )
    {
        return new RenderFrameState(
            tick,
            $"FRAME::{tick}",
            true,
            $"Replay Frame {tick}"
        );
    }

    public BoardViewState CreateBoard(
        long tick,
        int zones,
        int players
    )
    {
        return new BoardViewState(
            zones,
            players,
            tick,
            $"BOARD::{tick}::{zones}::{players}"
        );
    }
}
