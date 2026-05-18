namespace FOTN.Engine.Replay;

/// <summary>
/// Reads replay frame sequences for reconstruction and validation.
/// Replay order must remain deterministic.
/// </summary>
public sealed class ReplayReader
{
    public IEnumerable<ReplayFrame> Read(IEnumerable<ReplayFrame> frames)
    {
        ArgumentNullException.ThrowIfNull(frames);

        foreach (var frame in frames)
        {
            yield return frame;
        }
    }
}
