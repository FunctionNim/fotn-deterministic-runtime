namespace FOTN.Engine.Actions;

public sealed class ActionIntent
{
    public Guid IntentId { get; init; }

    public long Tick { get; init; }

    public required string ActorId { get; init; }

    public required string ActionType { get; init; }

    public required string SourceId { get; init; }

    public List<string> TargetIds { get; init; } = new();

    public Dictionary<string, string> Parameters { get; init; } = new();

    public bool Locked { get; set; }

    public bool Resolved { get; set; }
}
