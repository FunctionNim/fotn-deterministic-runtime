namespace FOTN.Engine.Persistence;

public sealed record CivilizationProfile
(
    string CivilizationId,
    string Name,
    int Age,
    int Stability,
    string StateHash
);
