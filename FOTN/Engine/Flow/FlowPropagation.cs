namespace FOTN.Engine.Flow;

/// <summary>
/// Executes deterministic consequence propagation across Flow edges.
/// </summary>
public sealed class FlowPropagation
{
    public IEnumerable<FlowNode> Propagate(
        FlowNode origin,
        IEnumerable<FlowEdge> edges)
    {
        ArgumentNullException.ThrowIfNull(edges);

        foreach (var edge in edges)
        {
            if (edge.Source == origin)
            {
                yield return edge.Target;
            }

            if (edge.Bidirectional && edge.Target == origin)
            {
                yield return edge.Source;
            }
        }
    }
}
