namespace FOTN.Engine.Core;

/// <summary>
/// Player or system-declared intent before runtime pipeline execution.
/// Intent is the first executable expression of an outcome request.
/// </summary>
public readonly record struct IntentDeclaration(
    string ActorId,
    string IntentType,
    string TargetId,
    ulong Tick
);
