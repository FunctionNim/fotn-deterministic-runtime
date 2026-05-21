namespace FOTN.Engine.Pipeline;

public sealed record PipelineResult
(
    bool Success,
    int ExecutedStepCount,
    string Outcome,
    string StateHash
);
