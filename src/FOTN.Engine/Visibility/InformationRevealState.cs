namespace FOTN.Engine.Visibility;

public sealed record InformationRevealState
(
    long Tick,
    bool RevealAuthorized,
    int VisibleConsequences,
    string StateHash
);
