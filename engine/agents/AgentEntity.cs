namespace FOTN.Engine.Agents;

public sealed class AgentEntity
{
    public required string AgentId { get; init; }

    public required string OwnerId { get; init; }

    public string DisplayName { get; set; } = string.Empty;

    public int Attack { get; set; }

    public int Barrier { get; set; }

    public bool Exhausted { get; set; }

    public bool Defeated { get; set; }

    public string CurrentZone { get; set; } = "Home";
}
