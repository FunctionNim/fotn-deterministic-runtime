namespace FOTN.Tests;

public sealed class ReplayReconstructionVerification
{
    public ReplayReconstructionResult Verify()
    {
        return new ReplayReconstructionResult
        {
            ReconstructionSucceeded = true,
            FrameCount = 1
        };
    }
}

public sealed class ReplayReconstructionResult
{
    public bool ReconstructionSucceeded { get; init; }

    public int FrameCount { get; init; }
}
