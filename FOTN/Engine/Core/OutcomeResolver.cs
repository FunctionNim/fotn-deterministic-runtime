namespace FOTN.Engine.Core;

/// <summary>
/// Resolves deterministic outcomes after runtime pipeline completion.
/// </summary>
public sealed class OutcomeResolver
{
    public string Resolve(IntentDeclaration intent)
    {
        return $"Resolved: {intent.IntentType} -> {intent.TargetId}";
    }
}
