namespace FOTN.Engine.Core;

/// <summary>
/// Deterministic action pipeline executor.
/// Players declare outcomes; the runtime executes ordered steps.
/// </summary>
public sealed class ActionPipeline
{
    private readonly List<string> _steps = new();

    public IReadOnlyList<string> Steps => _steps;

    public void AddStep(string step)
    {
        _steps.Add(step);
    }
}
