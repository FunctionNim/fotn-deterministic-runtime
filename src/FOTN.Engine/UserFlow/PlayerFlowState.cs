namespace FOTN.Engine.UserFlow;

public sealed record PlayerFlowState
(
    string PlayerId,
    int StepCount,
    bool Complete,
    string StateHash
);
