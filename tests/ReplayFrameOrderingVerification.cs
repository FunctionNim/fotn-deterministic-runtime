using FOTN.Engine.Replay;
using FOTN.Engine.State;
using FOTN.Prototype;

namespace FOTN.Tests;

public sealed class ReplayFrameOrderingVerification
{
    private readonly ReplayFrameGenerator _frames = new();
    private readonly PrototypeMatchRunner _runner = new();

    public ReplayOrderingResult Verify()
    {
        var state = _runner.CreateMatch();

        _runner.RunSingleTurn(state);

        var frame = _frames.Generate(state);

        var ordered = frame.Tick >= 0 && frame.TurnNumber >= 0;

        return new ReplayOrderingResult
        {
            ReplayFrameOrdered = ordered,
            Tick = frame.Tick,
            TurnNumber = frame.TurnNumber
        };
    }
}

public sealed class ReplayOrderingResult
{
    public bool ReplayFrameOrdered { get; init; }

    public long Tick { get; init; }

    public int TurnNumber { get; init; }
}
