namespace FOTN.Engine.Replay;

/// <summary>
/// A single replay frame captured after deterministic runtime execution.
/// The frame hash is the verification anchor for replay equivalence.
/// </summary>
public readonly record struct ReplayFrame(
    ulong Tick,
    string StateHash,
    string? EventId = null
);
