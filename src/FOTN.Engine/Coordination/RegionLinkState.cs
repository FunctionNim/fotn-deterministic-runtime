namespace FOTN.Engine.Coordination;

public sealed record RegionLinkState
(
    int LinkedRegions,
    int ActivePaths,
    bool Stable,
    string LinkHash
);
