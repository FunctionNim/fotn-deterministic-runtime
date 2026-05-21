namespace FOTN.Engine.Functions;

public sealed record FunctionPressureCollision
(
    FunctionId Source,
    FunctionId Target,
    int PressureValue,
    bool Stabilized
);
