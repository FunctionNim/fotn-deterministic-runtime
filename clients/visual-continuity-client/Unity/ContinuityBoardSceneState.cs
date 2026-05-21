namespace VisualContinuityClient.Unity;

public sealed record ContinuityBoardSceneState
(
    bool Connected,
    int VisibleZones,
    bool FunctionBoxVisible,
    bool ReplayVisible,
    string SceneHash
);
