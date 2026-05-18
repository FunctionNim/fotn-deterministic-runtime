namespace FOTN.Engine.Flow;

/// <summary>
/// Validates Flow integrity and prevents illegal routing states.
/// </summary>
public static class FlowValidation
{
    public static bool ValidateEdge(FlowEdge edge)
    {
        return edge.Weight >= 0
            && edge.Source.Id != edge.Target.Id;
    }
}
