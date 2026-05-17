namespace FOTN.Engine.State;

public sealed class AuditEvent
{
    public Guid EventId { get; init; }

    public long Tick { get; init; }

    public int TurnNumber { get; init; }

    public string Phase { get; init; } = string.Empty;

    public string ActorId { get; init; } = string.Empty;

    public string ActionType { get; init; } = string.Empty;

    public string SourceId { get; init; } = string.Empty;

    public List<string> TargetIds { get; init; } = new();

    public string BeforeStateHash { get; init; } = string.Empty;

    public string AfterStateHash { get; init; } = string.Empty;

    public string ConsequenceSummary { get; init; } = string.Empty;
}
