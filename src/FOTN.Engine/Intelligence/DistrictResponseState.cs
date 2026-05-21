namespace FOTN.Engine.Intelligence;

public sealed record DistrictResponseState
(
    string DistrictId,
    int ResponseLevel,
    bool Stable,
    string ResponseHash
);
