namespace FOTN.Engine.Runtime;

public sealed class RuntimeFailureReporter
{
    public RuntimeFailureReport Create(
        string system,
        string error,
        long tick)
    {
        return new RuntimeFailureReport
        {
            FailureId = Guid.NewGuid(),
            System = system,
            Error = error,
            Tick = tick,
            Timestamp = DateTime.UtcNow
        };
    }
}

public sealed class RuntimeFailureReport
{
    public Guid FailureId { get; init; }

    public string System { get; init; } = string.Empty;

    public string Error { get; init; } = string.Empty;

    public long Tick { get; init; }

    public DateTime Timestamp { get; init; }
}
