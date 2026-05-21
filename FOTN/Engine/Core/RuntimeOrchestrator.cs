namespace FOTN.Engine.Core;

/// <summary>
/// Central deterministic orchestration authority.
/// Players declare outcomes; the runtime executes ordered pipelines.
/// </summary>
public sealed class RuntimeOrchestrator
{
    private readonly ActionPipeline _pipeline = new();
    private readonly OutcomeResolver _resolver = new();
    private readonly ResolutionLock _resolutionLock = new();

    public string Execute(IntentDeclaration intent)
    {
        _pipeline.AddStep($"Intent:{intent.IntentType}");

        _resolutionLock.Lock();

        return _resolver.Resolve(intent);
    }
}
