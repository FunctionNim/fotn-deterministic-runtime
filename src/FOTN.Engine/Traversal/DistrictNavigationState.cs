namespace FOTN.Engine.Traversal;

public sealed record DistrictNavigationState
(
    string PlayerId,
    string CurrentDistrictId,
    string TargetDistrictId,
    bool InTransit,
    long Tick
);
