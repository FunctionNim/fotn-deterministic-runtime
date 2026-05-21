namespace FOTN.Engine.Client;

public sealed record RuntimeHandshake
(
    string SessionId,
    string RuntimeVersion,
    bool ReplayEnabled,
    bool Accepted
);
