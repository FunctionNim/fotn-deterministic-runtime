namespace FOTN.Engine.Identity;

public sealed record ReplayIdentityState
(
    int ReplayArchives,
    int IdentityLinks,
    bool Stable,
    string ReplayHash
);
