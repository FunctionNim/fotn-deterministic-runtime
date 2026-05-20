namespace FOTN.Engine.Functions;

public sealed record FunctionRelationshipSnapshot
(
    string FunctionId,
    string Opposition,
    string Dependency,
    string FeedTarget,
    string PressureType,
    string StateHash
);
