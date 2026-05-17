using FOTN.Engine.Combat;

namespace FOTN.Engine.Battle;

public sealed class BattleContext
{
    public Guid BattleId { get; init; }

    public int TurnNumber { get; init; }

    public long Tick { get; init; }

    public List<string> Attackers { get; init; } = new();

    public List<string> Blockers { get; init; } = new();

    public List<DamageIntent> DamageIntents { get; init; } = new();

    public bool ResolutionLocked { get; set; }

    public bool DamageResolved { get; set; }
}
