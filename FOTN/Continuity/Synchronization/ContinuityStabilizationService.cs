namespace FOTN.Continuity.Synchronization;

/// <summary>
/// Determines whether continuity may safely resume after recovery.
/// </summary>
public sealed class ContinuityStabilizationService
{
    public bool CanStabilize(
        ContinuityRecoveryRequest request,
        string observedStateHash,
        string activeCanonVersion)
    {
        return
            request.TargetStateHash == observedStateHash &&
            request.CanonVersion == activeCanonVersion;
    }
}
