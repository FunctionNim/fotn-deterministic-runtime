namespace FOTN.Engine.Networking;

/// <summary>
/// Transport abstraction for deterministic simulation snapshots.
/// </summary>
public interface IRuntimeChannel
{
    void Publish(NetworkSnapshot snapshot);

    NetworkSnapshot Consume();
}
