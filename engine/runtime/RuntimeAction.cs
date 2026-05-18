namespace FOTN.Engine.Runtime;

public sealed record RuntimeAction
(
    Guid ActionId,
    Guid IntentId,
    string ActorId,
    string ActionType,
    IReadOnlyList<string> TargetIds,
    IReadOnlyDictionary<string, string> Parameters,
    long Tick
);
