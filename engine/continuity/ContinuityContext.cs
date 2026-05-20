namespace FOTN.Engine.Continuity;

public sealed record ContinuityContext
(
    string ContinuityId,
    string MaturityClass,
    long Tick,
    string StateHash
);
