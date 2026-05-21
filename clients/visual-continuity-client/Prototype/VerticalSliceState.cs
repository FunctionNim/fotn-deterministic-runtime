namespace VisualContinuityClient.Prototype;

public sealed record VerticalSliceState
(
    string PlayerId,
    bool Connected,
    bool BoardVisible,
    bool FunctionBoxReady,
    bool InteractionResolved,
    bool ReplayFrameVisible,
    string StateHash
);
