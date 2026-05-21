namespace FOTN.Engine.Runtime;

public sealed record Intent
(
    Guid IntentId,
    string PlayerId,
    string IntentType,
    IReadOnlyList<string> Targets,
    IReadOnlyDictionary<string, string> Metadata,
    long Tick
);
