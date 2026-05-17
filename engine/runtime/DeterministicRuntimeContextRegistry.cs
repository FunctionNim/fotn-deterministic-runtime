namespace FOTN.Engine.Runtime;

public static class DeterministicRuntimeContextRegistry
{
    private static readonly DeterministicRuntimeContext SharedContext = new();

    public static DeterministicRuntimeContext Shared => SharedContext;

    public static void Reset()
    {
        SharedContext.Reset();
    }
}
