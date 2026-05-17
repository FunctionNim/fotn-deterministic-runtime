using FOTN.Engine.Actions;
using FOTN.Engine.Queueing;
using FOTN.Engine.State;

namespace FOTN.Engine.Runtime;

public sealed class RuntimeActionProcessor
{
    private readonly ActionQueue _queue = new();

    public void Queue(ActionIntent intent)
    {
        _queue.Enqueue(intent);
    }

    public IReadOnlyCollection<ActionIntent> Snapshot()
    {
        return _queue.Snapshot();
    }

    public void Process(GameState state)
    {
        while (_queue.Count > 0)
        {
            var action = _queue.Dequeue();

            action.Resolved = true;

            state.DeterministicTick++;
        }
    }
}
