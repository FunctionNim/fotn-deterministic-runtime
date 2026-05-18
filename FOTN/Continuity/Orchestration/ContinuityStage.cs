namespace FOTN.Continuity.Orchestration;

/// <summary>
/// Ordered stages for a constructed continuity experience.
/// </summary>
public enum ContinuityStage
{
    Construct,
    Synchronize,
    Audit,
    Execute,
    Return,
    Replay,
    Verdict,
    Trial,
    Archive
}
