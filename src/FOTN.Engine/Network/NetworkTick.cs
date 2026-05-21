namespace FOTN.Engine.Network;

public sealed record NetworkTick
(
    long Tick,
    long Sequence,
    string RegionId,
    string StateHash
);
