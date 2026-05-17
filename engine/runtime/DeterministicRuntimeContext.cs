namespace FOTN.Engine.Runtime;

public sealed class DeterministicRuntimeContext
{
    public DeterministicIdProvider Ids { get; } = new();

    public DeterministicClockService Clock { get; } = new();

    public void Reset()
    {
        Ids.Reset();
        Clock.Reset();
    }
}
