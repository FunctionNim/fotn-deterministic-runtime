namespace FOTN.Engine.Persistence;

public sealed record ContinuitySaveState
(
    Guid SaveId,
    long Tick,
    int CivilizationCount,
    string SaveHash
);
