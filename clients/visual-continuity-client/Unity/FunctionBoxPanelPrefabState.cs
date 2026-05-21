namespace VisualContinuityClient.Unity;

public sealed record FunctionBoxPanelPrefabState
(
    string PlayerId,
    int VisibleFunctions,
    bool Locked,
    string PrefabHash
);
