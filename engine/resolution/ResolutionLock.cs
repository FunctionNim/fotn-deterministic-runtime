namespace FOTN.Engine.Resolution;

public sealed class ResolutionLock
{
    public Guid ResolutionLockId { get; init; }

    public long Tick { get; init; }

    public bool TargetsLocked { get; set; }

    public bool DamageLocked { get; set; }

    public bool ResolutionComplete { get; set; }

    public List<Guid> LockedIntentIds { get; init; } = new();
}
