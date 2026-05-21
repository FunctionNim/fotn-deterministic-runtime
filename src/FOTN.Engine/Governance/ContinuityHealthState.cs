namespace FOTN.Engine.Governance;

public sealed record ContinuityHealthState
(
    long Tick,
    int StabilityScore,
    int PressureLoad,
    bool InterventionRecommended,
    string StateHash
);
