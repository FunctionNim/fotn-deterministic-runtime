namespace FOTN.Engine.Networking;

/// <summary>
/// Deterministic lockstep tick synchronization controller.
/// </summary>
public sealed class TickSync
{
    public ulong CurrentTick { get; private set; }

    public bool Validate(ulong remoteTick)
    {
        return remoteTick == CurrentTick;
    }

    public void Advance()
    {
        CurrentTick++;
    }
}
