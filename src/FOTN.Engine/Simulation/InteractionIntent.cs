namespace FOTN.Engine.Simulation;

public sealed record InteractionIntent
(
    string SourceEntityId,
    string TargetEntityId,
    string InteractionType,
    long Tick
);
