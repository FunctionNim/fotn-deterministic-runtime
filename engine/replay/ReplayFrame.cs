namespace FOTN.Engine.Replay;

public sealed class ReplayFrame
{
    public long Tick { get; init; }

    public int TurnNumber { get; init; }

    public string Phase { get; init; } = string.Empty;

    public string StateHash { get; init; } = string.Empty;

    public List<Guid> AuditEventIds { get; init; } = new();
}
