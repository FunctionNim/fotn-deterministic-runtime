namespace FOTN.Engine.Legacy;

public sealed record ContinuityChainState
(
    string ChainId,
    string SourceId,
    string TargetId,
    long RecordedTick,
    string ChainHash
);
