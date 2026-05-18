namespace FOTN.Engine.Persistence;

/// <summary>
/// Serializes runtime state into deterministic persistence representations.
/// </summary>
public static class StateSerializer
{
    public static string Serialize(object state)
    {
        ArgumentNullException.ThrowIfNull(state);
        return state.ToString() ?? string.Empty;
    }
}
