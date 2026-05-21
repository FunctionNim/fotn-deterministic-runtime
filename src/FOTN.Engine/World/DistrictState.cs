namespace FOTN.Engine.World;

public sealed record DistrictState
(
    string DistrictId,
    string DominantFunction,
    int PressureValue,
    int StabilityValue,
    long Tick
);
