using FOTN.Engine.Replay;
using FOTN.Engine.State;

namespace FOTN.Prototype;

public sealed class FullMatchReplayRunner
{
    private readonly ReplayFrameGenerator _frames = new();
    private readonly ReplaySerializer _serializer = new();

    public string BuildReplay(GameState state)
    {
        var replayFrame = _frames.Generate(state);

        return _serializer.Serialize(new[] { replayFrame });
    }
}
