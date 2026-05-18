namespace FOTN.Engine.Flow;

/// <summary>
/// A deterministic node in the Flow network.
/// Flow nodes represent places where consequence can collect, stabilize, or route onward.
/// </summary>
public readonly record struct FlowNode(
    int Id,
    string Label,
    int Resonance = 0,
    int Stability = 0
);
