namespace FOTN.Engine.Evolution;

public sealed record EvolutionTickState
(
    long Tick,
    int CivilizationCount,
    int DistrictCount,
    int DriftValue,
    string StateHash
);
