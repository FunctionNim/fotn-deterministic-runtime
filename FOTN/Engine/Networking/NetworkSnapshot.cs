namespace FOTN.Engine.Networking;

/// <summary>
/// Network-safe state snapshot used for deterministic synchronization.
/// </summary>
public readonly record struct NetworkSnapshot(
    ulong Tick,
    string StateHash,
    string SourceNode
);
