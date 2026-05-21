using FOTN.Engine.RuntimeLoop;

namespace FOTN.Tests;

public sealed class AuthoritativeRuntimeLoopTests
{
    public void RuntimeLoop_ShouldAdvanceDeterministically()
    {
        var scheduler = new DeterministicScheduler();

        var loop = new AuthoritativeRuntimeLoop(scheduler);

        loop.Start();

        loop.Advance();
        loop.Advance();

        if (loop.CurrentState.Tick != 2)
        {
            throw new Exception("Runtime loop tick progression failed.");
        }

        if (loop.Frames.Count != 2)
        {
            throw new Exception("Replay frame generation failed.");
        }
    }
}
