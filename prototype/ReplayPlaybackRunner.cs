using FOTN.Engine.Replay;

namespace FOTN.Prototype;

public sealed class ReplayPlaybackRunner
{
    private readonly ReplaySerializer _serializer = new();

    public IReadOnlyCollection<string> Playback(string payload)
    {
        var frames = _serializer.Deserialize(payload);

        return frames
            .Select(x =>
                $"Tick {x.Tick} | Turn {x.TurnNumber} | Phase {x.Phase} | Hash {x.StateHash}")
            .ToList()
            .AsReadOnly();
    }
}
