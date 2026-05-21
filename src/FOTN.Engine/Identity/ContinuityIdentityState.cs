namespace FOTN.Engine.Identity;

public sealed record ContinuityIdentityState
(
    string IdentityId,
    string OwnerId,
    int Age,
    bool Stable,
    string IdentityHash
);
