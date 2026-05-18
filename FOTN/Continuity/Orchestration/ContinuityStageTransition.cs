namespace FOTN.Continuity.Orchestration;

/// <summary>
/// Describes one allowed movement between continuity lifecycle stages.
/// </summary>
public sealed record ContinuityStageTransition(
    ContinuityStage From,
    ContinuityStage To,
    string Reason
);
