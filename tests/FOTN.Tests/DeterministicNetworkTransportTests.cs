using FOTN.Engine.Network;

namespace FOTN.Tests;

public sealed class DeterministicNetworkTransportTests
{
    public void Transport_ShouldReturnPacketsInOrder()
    {
        var transport = new InMemoryContinuityTransport();

        transport.Send(
            new StatePacket(
                "PACKET_002",
                "REGION_A",
                2,
                "STATE_B",
                "HASH_B"
            )
        );

        transport.Send(
            new StatePacket(
                "PACKET_001",
                "REGION_A",
                1,
                "STATE_A",
                "HASH_A"
            )
        );

        var packets = transport.ReceiveAll();

        if (packets[0].Tick != 1)
        {
            throw new Exception("Deterministic transport ordering failed.");
        }
    }
}
