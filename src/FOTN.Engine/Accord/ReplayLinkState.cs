namespace FOTN.Engine.Accord;

public sealed record ReplayLinkState
(
    int ReplayArchives,
    int LinkedArchives,
    bool Stable,
    string LinkHash
);
