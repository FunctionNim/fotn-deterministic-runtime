using FOTN.Engine.Runtime;

namespace FOTN.Engine.Runtime;

public sealed class DeterministicRuntimeCore : IRuntimeCore
{
    public RuntimeResult Execute(Intent intent)
    {
        return new RuntimeResult(
            Success: true,
            Outcome: $"Intent '{intent.IntentType}' accepted for deterministic execution.",
            GeneratedEventIds: Array.Empty<string>(),
            StateHash: "BOOTSTRAP_HASH_PENDING"
        );
    }
}
