namespace VisualContinuityClient.Prototype;

public sealed record PrototypeFunctionBoxInteraction
(
    string PlayerId,
    int SelectedFunctions,
    bool Locked,
    string InteractionHash
);
