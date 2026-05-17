namespace FOTN.Engine.Runtime;

public sealed class DeterministicFailureReportFactory
{
    private readonly DeterministicRuntimeContext _runtime;

    public DeterministicFailureReportFactory(
        DeterministicRuntimeContext runtime)
    {
        _runtime = runtime;
    }

    public RuntimeFailureReport Create(
        string system,
        string error)
    {
        return new RuntimeFailureReport
        {
            FailureId = Guid.Parse("00000000-0000-0000-0000-" + _runtime.Ids.Next("FAIL").Replace("FAIL_", "")),
            System = system,
            Error = error,
            Tick = _runtime.Clock.Advance(),
            Timestamp = _runtime.Clock.TickLabel()
        };
    }
}
