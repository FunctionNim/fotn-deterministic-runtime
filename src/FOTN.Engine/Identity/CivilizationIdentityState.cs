namespace FOTN.Engine.Identity;

public sealed record CivilizationIdentityState
(
    string CivilizationId,
    int IdentityStrength,
    bool Persistent,
    string IdentityHash
);
