namespace FOTN.Engine.Resolution;

public sealed record TreasureSettlementResult
(
    string PlayerId,
    int TreasureAwarded,
    int MomentumAwarded,
    bool VictoryReached
);
