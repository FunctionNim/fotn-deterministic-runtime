using VisualContinuityClient.Prototype;

namespace VisualContinuityClient.Unity;

public sealed class UnityRuntimeBridge
{
    public ContinuityBoardSceneState BuildScene(
        VerticalSliceState slice,
        int zones
    )
    {
        return new ContinuityBoardSceneState(
            slice.Connected,
            zones,
            slice.FunctionBoxReady,
            slice.ReplayFrameVisible,
            slice.StateHash
        );
    }
}
