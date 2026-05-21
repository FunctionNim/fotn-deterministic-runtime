namespace VisualContinuityClient.Unity;

public sealed record SceneManifest
(
    string SceneName,
    string BoardRoot,
    string ZoneRoot,
    string FunctionBoxRoot,
    string ReplayRoot,
    string InteractionRoot
);
