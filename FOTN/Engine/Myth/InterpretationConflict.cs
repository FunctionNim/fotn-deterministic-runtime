namespace FOTN.Engine.Myth;

/// <summary>
/// Tracks unresolved interpretive conflicts between myth states.
/// </summary>
public sealed class InterpretationConflict
{
    private readonly List<(MythState A, MythState B)> _conflicts = new();

    public IReadOnlyList<(MythState A, MythState B)> Conflicts => _conflicts;

    public void Register(MythState a, MythState b)
    {
        _conflicts.Add((a, b));
    }
}
