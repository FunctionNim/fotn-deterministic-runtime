using FOTN.Engine.Replay;

namespace FOTN.Engine.RuntimeLoop;

public sealed class AuthoritativeRuntimeLoop
{
    private readonly DeterministicScheduler _scheduler;

    private readonly List<ReplayFrame> _frames = new();

    public IReadOnlyList<ReplayFrame> Frames => _frames;

    public RuntimeLoopState CurrentState { get; private set; } =
        new(
            Tick: 0,
            Sequence: 0,
            IsRunning: false,
            StateHash: "BOOTSTRAP_PENDING"
        );

    public AuthoritativeRuntimeLoop(
        DeterministicScheduler scheduler
    )
    {
        _scheduler = scheduler;
    }

    public void Start()
    {
        CurrentState = CurrentState with
        {
            IsRunning = true
        };
    }

    public void Advance()
    {
        var nextTick = CurrentState.Tick + 1;

        var sequence = _scheduler.NextSequence();

        var hash = $"LOOP::{nextTick}::{sequence}";

        CurrentState = new RuntimeLoopState(
            Tick: nextTick,
            Sequence: sequence,
            IsRunning: true,
            StateHash: hash
        );

        _frames.Add(
            new ReplayFrame(
                nextTick,
                sequence,
                hash
            )
        );
    }
}
