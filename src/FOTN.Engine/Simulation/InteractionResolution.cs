namespace FOTN.Engine.Simulation;

public sealed record InteractionResolution
(
    bool Success,
    string Outcome,
    int DamageApplied,
    string StateHash
);
