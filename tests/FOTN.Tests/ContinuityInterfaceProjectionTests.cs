using FOTN.Engine.Interface;

namespace FOTN.Tests;

public sealed class ContinuityInterfaceProjectionTests
{
    public void InterfaceProjection_ShouldBuildReplayState()
    {
        var service = new ContinuityInterfaceProjectionService();

        var replay = service.BuildReplay(
            10,
            50
        );

        if (replay.TotalFrames != 50)
        {
            throw new Exception("Replay timeline projection failed.");
        }
    }
}
