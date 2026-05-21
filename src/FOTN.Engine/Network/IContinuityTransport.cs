namespace FOTN.Engine.Network;

public interface IContinuityTransport
{
    void Send(StatePacket packet);

    IReadOnlyList<StatePacket> ReceiveAll();
}
