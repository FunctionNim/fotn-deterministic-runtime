namespace FOTN.Engine.Evolution;

public sealed record RegionChangeState
(
    string RegionId,
    int ChangeLevel,
    bool Active,
    string ChangeHash
);
