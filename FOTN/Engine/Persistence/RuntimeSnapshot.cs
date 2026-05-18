namespace FOTN.Engine.Persistence;

/// <summary>
/// A deterministic snapshot of runtime state.
/// Snapshots are persistence anchors for replay reconstruction and recovery.
/// </summary>
public readonly record struct RuntimeSnapshot(
    ulong Tick,
    string StateHash,
    string CanonVersion,
    DateTimeOffset CreatedAt
);
