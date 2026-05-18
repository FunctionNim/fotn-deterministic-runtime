namespace FOTN.Continuity.Replay;

/// <summary>
/// Validates replay reconstruction requests against preserved replay continuity records.
/// </summary>
public sealed class ReplayReconstructionService
{
    public bool CanReconstruct(
        ReplayContinuityRecord record,
        ReplayReconstructionRequest request)
    {
        return
            record.ExperienceId == request.ExperienceId &&
            record.ReplayRecordId == request.ReplayRecordId &&
            record.InitialStateHash == request.ExpectedInitialStateHash &&
            record.FinalStateHash == request.ExpectedFinalStateHash &&
            record.CanonVersion == request.CanonVersion;
    }
}
