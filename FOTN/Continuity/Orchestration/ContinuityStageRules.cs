namespace FOTN.Continuity.Orchestration;

/// <summary>
/// Defines the default legal stage transitions for continuity processing.
/// </summary>
public static class ContinuityStageRules
{
    public static bool IsAllowed(ContinuityStage from, ContinuityStage to) =>
        (from, to) switch
        {
            (ContinuityStage.Construct, ContinuityStage.Synchronize) => true,
            (ContinuityStage.Synchronize, ContinuityStage.Audit) => true,
            (ContinuityStage.Audit, ContinuityStage.Execute) => true,
            (ContinuityStage.Execute, ContinuityStage.Return) => true,
            (ContinuityStage.Return, ContinuityStage.Replay) => true,
            (ContinuityStage.Replay, ContinuityStage.Verdict) => true,
            (ContinuityStage.Verdict, ContinuityStage.Trial) => true,
            (ContinuityStage.Trial, ContinuityStage.Archive) => true,
            _ => false
        };
}
