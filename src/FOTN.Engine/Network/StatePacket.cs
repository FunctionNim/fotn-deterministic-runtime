namespace FOTN.Engine.Network;

public sealed record StatePacket
(
    string PacketId,
    string RegionId,
    long Tick,
    string Data,
    string StateHash
);
