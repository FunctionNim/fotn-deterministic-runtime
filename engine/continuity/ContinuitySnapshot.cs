namespace FOTN.Engine.Continuity;

public sealed record ContinuitySnapshot
(
    string ContinuityId,
    string MaturityClass,
    long Tick,
    string StateHash,
    bool Survivable
);
