using FOTN.Engine.Actions;

namespace FOTN.Engine.Runtime;

public sealed class DeterministicInputRecorder
{
    private readonly List<ActionIntent> _recordedInputs = new();

    public void Record(ActionIntent intent)
    {
        _recordedInputs.Add(intent);
    }

    public IReadOnlyCollection<ActionIntent> Snapshot()
    {
        return _recordedInputs
            .OrderBy(x => x.Tick)
            .ThenBy(x => x.IntentId)
            .ToList()
            .AsReadOnly();
    }
}
