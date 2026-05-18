namespace FOTN.Engine.Flow;

/// <summary>
/// Directed deterministic connection between two Flow nodes.
/// Edges define how consequence propagates through the runtime.
/// </summary>
public readonly record struct FlowEdge(
    FlowNode Source,
    FlowNode Target,
    int Weight = 1,
    bool Bidirectional = false
);
