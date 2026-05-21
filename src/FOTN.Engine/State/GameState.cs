namespace FOTN.Engine.State;

public sealed class GameState
{
    public Guid MatchId { get; set; } = Guid.NewGuid();

    public long DeterministicTick { get; set; }

    public int TurnNumber { get; set; } = 1;

    public Phase CurrentPhase { get; set; } = Phase.Start;

    public string StateHash { get; set; } = string.Empty;

    public List<string> AuditLog { get; set; } = new();
}
