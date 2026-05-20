namespace FOTN.Engine.InformationBox;

public sealed record InformationBoxSnapshot
(
    long Tick,
    string StateHash,
    bool RevealAuthorized,
    int VisibleOutcomeCount,
    int VisibleRoutingEvents
);
