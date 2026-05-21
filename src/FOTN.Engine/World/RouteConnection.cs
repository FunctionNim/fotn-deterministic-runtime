namespace FOTN.Engine.World;

public sealed record RouteConnection
(
    string SourceDistrictId,
    string TargetDistrictId,
    int RoutePressure,
    bool IsStable
);
