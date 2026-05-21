namespace FOTN.Engine.Snapshots;

public sealed record StateSnapshot
(
    Guid MatchId,
    long Tick,
    int Version,
    string StateHash,
    string Payload
);
