namespace FOTN.Engine.State;

public sealed class ZoneState
{
    public required string ZoneId { get; init; }

    public required string ZoneType { get; init; }

    public List<string> EntityIds { get; init; } = new();

    public bool IsPublic { get; set; }
}
