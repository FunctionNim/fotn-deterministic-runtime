using FOTN.Engine.Replay;
using FOTN.Engine.State;

namespace FOTN.Prototype;

public sealed class ReplayValidationTest
{
    private readonly ReplaySerializer _serializer = new();
    private readonly ReplayFrameGenerator _generator = new();

    public bool Validate(GameState state)
    {
        var frame = _generator.Generate(state);

        var payload = _serializer.Serialize(new[] { frame });

        var restored = _serializer.Deserialize(payload);

        return restored.First().StateHash == frame.StateHash;
    }
}
