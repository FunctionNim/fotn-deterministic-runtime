namespace FOTN.Engine.Flow;

/// <summary>
/// Determines deterministic routing paths for consequence movement.
/// Routing decisions must remain replay-safe.
/// </summary>
public sealed class FlowRouting
{
    public FlowNode Route(
        FlowNode current,
        IReadOnlyList<FlowNode> available)
    {
        ArgumentNullException.ThrowIfNull(available);

        if (available.Count == 0)
        {
            return current;
        }

        return available.OrderBy(node => node.Id).First();
    }
}
