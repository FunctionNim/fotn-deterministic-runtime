namespace VisualContinuityClient.Engine;

public sealed record FunctionBoxPanelRendererState
(
    string PlayerId,
    int FunctionCount,
    bool Locked,
    string RenderHash
);
