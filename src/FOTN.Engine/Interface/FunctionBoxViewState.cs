using FOTN.Engine.Functions;

namespace FOTN.Engine.Interface;

public sealed record FunctionBoxViewState
(
    string PlayerId,
    IReadOnlyList<FunctionId> VisibleFunctions,
    bool Locked
);
