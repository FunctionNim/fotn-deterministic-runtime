using System.Text.Json;

namespace FOTN.Engine.Replay;

public sealed class ReplaySerializer
{
    public string Serialize(
        IEnumerable<ReplayFrame> frames)
    {
        return JsonSerializer.Serialize(frames);
    }

    public IReadOnlyCollection<ReplayFrame> Deserialize(
        string payload)
    {
        return JsonSerializer.Deserialize<List<ReplayFrame>>(payload)
            ?? new List<ReplayFrame>();
    }
}
