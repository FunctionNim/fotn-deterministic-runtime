using FOTN.Engine.Functions;

namespace FOTN.Engine.Intelligence;

public sealed record FunctionPressureResponse
(
    FunctionId Function,
    int PressureValue,
    bool Active,
    string ResponseHash
);
