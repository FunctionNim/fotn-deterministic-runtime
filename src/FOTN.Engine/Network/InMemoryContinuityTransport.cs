namespace FOTN.Engine.Network;

public sealed class InMemoryContinuityTransport : IContinuityTransport
{
    private readonly List<StatePacket> _packets = new();

    public void Send(StatePacket packet)
    {
        _packets.Add(packet);
    }

    public IReadOnlyList<StatePacket> ReceiveAll()
    {
        return _packets.OrderBy(x => x.Tick).ToList();
    }
}
