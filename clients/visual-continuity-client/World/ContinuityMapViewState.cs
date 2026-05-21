namespace VisualContinuityClient.World;

public sealed record ContinuityMapViewState
(
    int VisibleDistricts,
    int ActivePaths,
    bool NavigationEnabled,
    string StateHash
);
