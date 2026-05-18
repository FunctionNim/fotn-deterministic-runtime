namespace FOTN.Engine.Replay;

/// <summary>
/// Validates deterministic replay equivalence between recorded frames.
/// </summary>
public static class ReplayValidation
{
    public static bool Validate(
        ReplayFrame expected,
        ReplayFrame actual)
    {
        return expected.Tick == actual.Tick
            && expected.StateHash == actual.StateHash;
    }
}
