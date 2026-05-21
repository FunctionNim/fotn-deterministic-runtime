namespace FOTN.Engine.Legacy;

public sealed record ReplayHeritageState
(
    int ReplayArchives,
    int LinkedChains,
    bool Stable,
    string HeritageHash
);
