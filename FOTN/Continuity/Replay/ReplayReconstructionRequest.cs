namespace FOTN.Continuity.Replay;

/// <summary>
/// Request data for reconstructing a preserved replay continuity record.
/// </summary>
public sealed record ReplayReconstructionRequest(
    Guid ExperienceId,
    string ReplayRecordId,
    string ExpectedInitialStateHash,
    string ExpectedFinalStateHash,
    string CanonVersion
);
