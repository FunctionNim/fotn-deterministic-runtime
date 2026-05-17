using FOTN.Engine.State;

namespace FOTN.Engine.Reporting;

public sealed class EndStepReportBuilder
{
    public EndStepReport Build(
        GameState state)
    {
        return new EndStepReport
        {
            TurnNumber = state.TurnNumber,
            Phase = state.CurrentPhase.ToString(),
            AuditEventCount = state.AuditLog.Count,
            StateHash = state.StateHash,
            Summary = $"Turn {state.TurnNumber} completed with {state.AuditLog.Count} audit events."
        };
    }
}

public sealed class EndStepReport
{
    public int TurnNumber { get; init; }

    public string Phase { get; init; } = string.Empty;

    public int AuditEventCount { get; init; }

    public string StateHash { get; init; } = string.Empty;

    public string Summary { get; init; } = string.Empty;
}
