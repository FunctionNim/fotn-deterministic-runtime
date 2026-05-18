namespace FOTN.Continuity.Orchestration;

/// <summary>
/// Provides the default ordered stages for a constructed continuity experience.
/// </summary>
public sealed class ExperienceLifecycleCoordinator
{
    public IReadOnlyList<ContinuityStage> Stages { get; } = new[]
    {
        ContinuityStage.Construct,
        ContinuityStage.Synchronize,
        ContinuityStage.Audit,
        ContinuityStage.Execute,
        ContinuityStage.Return,
        ContinuityStage.Replay,
        ContinuityStage.Verdict,
        ContinuityStage.Trial,
        ContinuityStage.Archive
    };

    public bool CanMove(ContinuityStage from, ContinuityStage to) =>
        ContinuityStageRules.IsAllowed(from, to);
}
