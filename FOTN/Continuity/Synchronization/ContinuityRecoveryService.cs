namespace FOTN.Continuity.Synchronization;

/// <summary>
/// Creates recovery requests after continuity divergence is detected.
/// </summary>
public sealed class ContinuityRecoveryService
{
    public ContinuityRecoveryRequest CreateRequest(
        Guid recoveryId,
        ContinuityDivergenceRecord divergence,
        string targetStateHash,
        string canonVersion,
        DateTimeOffset requestedAt)
    {
        return new ContinuityRecoveryRequest(
            recoveryId,
            divergence.ExperienceId,
            divergence.Tick,
            targetStateHash,
            canonVersion,
            requestedAt
        );
    }
}
