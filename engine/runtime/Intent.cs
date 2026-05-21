namespace FOTN.Engine.Runtime;

public sealed record Intent
(
    Guid IntentId,
    string ActorId,
    string IntentType,
    IReadOnlyList<string> TargetIds,
    IReadOnlyDictionary<string, string> Parameters,
    long DeclaredTick
);
