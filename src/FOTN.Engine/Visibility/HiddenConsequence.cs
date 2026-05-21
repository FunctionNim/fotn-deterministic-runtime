namespace FOTN.Engine.Visibility;

public sealed record HiddenConsequence
(
    string ConsequenceId,
    string SourceEntityId,
    string TargetEntityId,
    string ConsequenceType,
    int Value,
    long Tick,
    bool Revealed
);
