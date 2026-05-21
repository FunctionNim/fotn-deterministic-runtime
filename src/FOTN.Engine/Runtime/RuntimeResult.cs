namespace FOTN.Engine.Runtime;

public sealed record RuntimeResult
(
    bool Success,
    string Outcome,
    IReadOnlyList<string> GeneratedEventIds,
    string StateHash
);
