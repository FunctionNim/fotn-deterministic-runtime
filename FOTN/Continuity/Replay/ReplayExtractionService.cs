namespace FOTN.Continuity.Replay;

/// <summary>
/// Creates replay continuity records from returned continuity experience data.
/// </summary>
public sealed class ReplayExtractionService
{
    public ReplayContinuityRecord CreateRecord(
        Guid experienceId,
        string replayRecordId,
        ulong startTick,
        ulong finalTick,
        string initialStateHash,
        string finalStateHash,
        string canonVersion,
        DateTimeOffset recordedAt)
    {
        return new ReplayContinuityRecord(
            experienceId,
            replayRecordId,
            startTick,
            finalTick,
            initialStateHash,
            finalStateHash,
            canonVersion,
            recordedAt
        );
    }
}
