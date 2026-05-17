namespace FOTN.Engine.State;

public sealed class GameState
{
    public Guid MatchId { get; init; }

    public int TurnNumber { get; set; } = 1;

    public Phase CurrentPhase { get; set; } = Phase.StartOfTurn;

    public List<PlayerState> Players { get; init; } = new();

    public List<AuditEvent> AuditLog { get; init; } = new();

    public Dictionary<string, ZoneState> Zones { get; init; } = new();

    public string StateHash { get; set; } = string.Empty;

    public long DeterministicTick { get; set; }
}

public enum Phase
{
    StartOfTurn,
    MainStep,
    BattleStep,
    DamagePhase,
    EndStep
}
