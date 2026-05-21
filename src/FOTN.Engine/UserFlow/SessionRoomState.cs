namespace FOTN.Engine.UserFlow;

public sealed record SessionRoomState
(
    string RoomId,
    int PlayerCount,
    bool Ready,
    string StateHash
);
