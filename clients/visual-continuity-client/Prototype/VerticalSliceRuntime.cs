namespace VisualContinuityClient.Prototype;

public sealed class VerticalSliceRuntime
{
    public VerticalSliceState Create(
        string playerId
    )
    {
        return new VerticalSliceState(
            playerId,
            true,
            true,
            true,
            true,
            true,
            $"SLICE::{playerId}"
        );
    }
}
