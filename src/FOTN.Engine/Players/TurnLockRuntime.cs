namespace FOTN.Engine.Players;

public sealed class TurnLockRuntime
{
    private readonly List<FunctionBoxSelection> _selections = new();

    public IReadOnlyList<FunctionBoxSelection> Selections => _selections;

    public void Submit(FunctionBoxSelection selection)
    {
        _selections.Add(selection with { Locked = true });
    }

    public bool AllLocked()
    {
        return _selections.All(x => x.Locked);
    }
}
