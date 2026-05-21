namespace VisualContinuityClient.Interface;

public sealed record FunctionBoxPanelState
(
    string PlayerId,
    int VisibleFunctions,
    bool Locked,
    string StateHash
);
