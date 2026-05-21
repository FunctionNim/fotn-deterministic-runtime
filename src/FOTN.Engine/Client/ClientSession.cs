namespace FOTN.Engine.Client;

public sealed record ClientSession
(
    string SessionId,
    string PlayerId,
    bool Connected,
    long ConnectedTick
);
