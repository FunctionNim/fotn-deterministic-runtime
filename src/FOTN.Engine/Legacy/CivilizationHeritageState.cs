namespace FOTN.Engine.Legacy;

public sealed record CivilizationHeritageState
(
    string CivilizationId,
    int HeritageDepth,
    bool Preserved,
    string HeritageHash
);
