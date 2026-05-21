namespace VisualContinuityClient.Unity;

public sealed record ZoneRendererPrefabState
(
    string ZoneId,
    int EntityCount,
    bool Visible,
    string PrefabHash
);
