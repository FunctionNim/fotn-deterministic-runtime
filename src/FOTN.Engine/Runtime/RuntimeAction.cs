namespace FOTN.Engine.Runtime;

public sealed record RuntimeAction
(
    Guid ActionId,
    Guid IntentId,
    string PlayerId,
    string ActionType,
    IReadOnlyList<string> Targets,
    IReadOnlyDictionary<string, string> Metadata,
    long Tick
);
