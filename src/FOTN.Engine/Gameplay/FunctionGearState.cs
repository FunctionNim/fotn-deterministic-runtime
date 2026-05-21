namespace FOTN.Engine.Gameplay;

public sealed record FunctionGearState
(
    string GearId,
    string FunctionId,
    int Tier,
    bool Exhausted
);
