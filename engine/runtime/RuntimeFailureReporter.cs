namespace FOTN.Engine.Runtime;

public sealed class RuntimeFailureReporter
{
    private readonly DeterministicRuntimeContext _runtime = DeterministicRuntimeContextRegistry.Shared;

    public RuntimeFailureReport Create(
        string system,
        string error,
        long tick)
    {
        return new RuntimeFailureReport
        {
            FailureId = CreateDeterministicGuid("FAIL"),
            System = system,
            Error = error,
            Tick = _runtime.Clock.Advance(),
            Timestamp = _runtime.Clock.TickLabel()
        };
    }

    private Guid CreateDeterministicGuid(string prefix)
    {
        var id = _runtime.Ids.Next(prefix).Split('_').Last();

        return Guid.Parse($"00000000-0000-0000-0000-{id.PadLeft(12, '0')}");
    }
}

public sealed class RuntimeFailureReport
{
    public Guid FailureId { get; init; }

    public string System { get; init; } = string.Empty;

    public string Error { get; init; } = string.Empty;

    public long Tick { get; init; }

    public string Timestamp { get; init; } = string.Empty;
}
