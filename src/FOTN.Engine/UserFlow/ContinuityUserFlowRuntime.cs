namespace FOTN.Engine.UserFlow;

public sealed class ContinuityUserFlowRuntime
{
    public SessionRoomState CreateRoom(
        string roomId,
        int players
    )
    {
        return new SessionRoomState(
            roomId,
            players,
            players >= 4,
            $"ROOM::{roomId}::{players}"
        );
    }

    public ReplayTheaterState CreateReplay(
        long tick,
        int spectators
    )
    {
        return new ReplayTheaterState(
            true,
            tick,
            spectators,
            $"REPLAY::{tick}::{spectators}"
        );
    }
}
