using FOTN.Engine.Actions;

namespace FOTN.Engine.Queueing;

public sealed class ActionQueue
{
    private readonly Queue<ActionIntent> _queue = new();

    public int Count => _queue.Count;

    public void Enqueue(ActionIntent intent)
    {
        _queue.Enqueue(intent);
    }

    public ActionIntent Dequeue()
    {
        return _queue.Dequeue();
    }

    public IReadOnlyCollection<ActionIntent> Snapshot()
    {
        return _queue.ToList().AsReadOnly();
    }
}
