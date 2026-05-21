namespace FOTN.Engine.Functions;

public sealed record FunctionRelationship
(
    FunctionId Source,
    FunctionId Feeds,
    FunctionId DependsOn,
    FunctionId Opposes
);
