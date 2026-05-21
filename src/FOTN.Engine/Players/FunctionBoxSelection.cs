using FOTN.Engine.Functions;

namespace FOTN.Engine.Players;

public sealed record FunctionBoxSelection
(
    string PlayerId,
    IReadOnlyList<FunctionId> SelectedFunctions,
    bool Locked
);
