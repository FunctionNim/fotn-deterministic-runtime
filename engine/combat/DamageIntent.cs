namespace FOTN.Engine.Combat;

public sealed class DamageIntent
{
    public Guid DamageIntentId { get; init; }

    public long Tick { get; init; }

    public required string SourceId { get; init; }

    public required string AttackerId { get; init; }

    public required string TargetId { get; init; }

    public int DamageAmount { get; init; }

    public DamageIntentType IntentType { get; init; }

    public bool Locked { get; set; }

    public bool Resolved { get; set; }
}

public enum DamageIntentType
{
    Targeted,
    Redirected,
    Area
}
