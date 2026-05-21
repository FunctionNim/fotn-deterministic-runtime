namespace FOTN.Engine.Coordination;

public sealed record ContinuityLinkState
(
    string LinkId,
    string SourceIdentityId,
    string TargetIdentityId,
    bool Active,
    string LinkHash
);
