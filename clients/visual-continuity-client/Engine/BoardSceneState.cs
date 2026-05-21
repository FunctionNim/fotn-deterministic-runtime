namespace VisualContinuityClient.Engine;

public sealed record BoardSceneState
(
    int VisibleZones,
    int ActivePlayers,
    bool ReplayVisible,
    string SceneHash
);
