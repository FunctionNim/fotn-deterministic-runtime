namespace VisualContinuityClient.Unity;

public sealed class PrototypeBoardRenderer
{
    public SceneManifest CreateManifest()
    {
        return new SceneManifest(
            "ContinuityBoardScene",
            "BoardRoot",
            "ZoneRoot",
            "FunctionBoxRoot",
            "ReplayRoot",
            "InteractionRoot"
        );
    }
}
