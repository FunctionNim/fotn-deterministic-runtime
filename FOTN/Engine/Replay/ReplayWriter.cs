namespace FOTN.Engine.Replay;

/// <summary>
/// Responsible for recording deterministic replay frames.
/// Replay data is append-only and audit traceable.
/// </summary>
public sealed class ReplayWriter
{
    private readonly List<ReplayFrame> _frames = new();

    public IReadOnlyList<ReplayFrame> Frames => _frames;

    public void Record(ReplayFrame frame)
    {
        _frames.Add(frame);
    }
}
