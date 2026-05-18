namespace FOTN.Engine.Core;

/// <summary>
/// Prevents runtime mutation after deterministic resolution lock.
/// </summary>
public sealed class ResolutionLock
{
    public bool IsLocked { get; private set; }

    public void Lock()
    {
        IsLocked = true;
    }
}
