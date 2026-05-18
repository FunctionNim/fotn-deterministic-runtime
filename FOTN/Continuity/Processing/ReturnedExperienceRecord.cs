namespace FOTN.Continuity.Processing;

/// <summary>
/// A processed record returned to continuity after a constructed experience completes.
/// Returned records feed replay systems, Verdict extraction, Trial generation,
/// archive preservation, and continuity analysis.
/// </summary>
public sealed record ReturnedExperienceRecord(
    Guid ExperienceId,
    ulong FinalTick,
    string FinalStateHash,
    string ReplayRecordId,
    bool Archived,
    bool VerdictExtracted,
    bool TrialMaterialGenerated,
    DateTimeOffset ReturnedAt
);
