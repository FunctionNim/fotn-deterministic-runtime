namespace FOTN.Engine.Myth;

/// <summary>
/// Transfers symbolic meaning between evolving myth states.
/// </summary>
public sealed class SymbolicInheritance
{
    public MythState Inherit(
        MythState parent,
        string newInterpretation)
    {
        return parent with
        {
            CurrentInterpretation = newInterpretation,
            Drift = parent.Drift + 1
        };
    }
}
