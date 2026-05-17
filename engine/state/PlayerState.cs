namespace FOTN.Engine.State;

public sealed class PlayerState
{
    public required string PlayerId { get; init; }

    public string DisplayName { get; set; } = string.Empty;

    public int Momentum { get; set; }

    public int Treasure { get; set; }

    public List<string> FunctionBox { get; init; } = new();

    public List<string> HandZone { get; init; } = new();

    public List<string> HomeZone { get; init; } = new();

    public List<string> PublicZone { get; init; } = new();

    public List<string> PolarityZone { get; init; } = new();

    public bool HasPassedPriority { get; set; }
}
