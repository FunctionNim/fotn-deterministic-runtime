namespace FOTN.Engine.Functions;

public sealed class FunctionRelationshipRegistry
{
    public IReadOnlyList<FunctionRelationship> Relationships { get; } =
        new List<FunctionRelationship>
        {
            new(FunctionId.Red, FunctionId.Stone, FunctionId.Purple, FunctionId.Blue),
            new(FunctionId.Blue, FunctionId.Brown, FunctionId.Pink, FunctionId.Red),
            new(FunctionId.Purple, FunctionId.Green, FunctionId.Brown, FunctionId.Stone),
            new(FunctionId.Green, FunctionId.Black, FunctionId.Purple, FunctionId.Red),
            new(FunctionId.Black, FunctionId.White, FunctionId.Green, FunctionId.Gold),
            new(FunctionId.White, FunctionId.Red, FunctionId.Black, FunctionId.Brown)
        };
}
