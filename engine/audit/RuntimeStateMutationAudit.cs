using FOTN.Engine.Runtime;
using FOTN.Engine.State;

namespace FOTN.Engine.Audit;

public sealed class RuntimeStateMutationAudit
{
    private readonly DeterministicRuntimeContext _runtime = new();

    public MutationAuditRecord Record(
        string beforeHash,
        string afterHash,
        string mutationType)
    {
        return new MutationAuditRecord
        {
            MutationId = CreateDeterministicGuid("MUTATION"),
            BeforeHash = beforeHash,
            AfterHash = afterHash,
            MutationType = mutationType,
            Timestamp = _runtime.Clock.TickLabel()
        };
    }

    private Guid CreateDeterministicGuid(string prefix)
    {
        var id = _runtime.Ids.Next(prefix).Split('_').Last();

        return Guid.Parse($"00000000-0000-0000-0000-{id.PadLeft(12, '0')}");
    }
}

public sealed class MutationAuditRecord
{
    public Guid MutationId { get; init; }

    public string BeforeHash { get; init; } = string.Empty;

    public string AfterHash { get; init; } = string.Empty;

    public string MutationType { get; init; } = string.Empty;

    public string Timestamp { get; init; } = string.Empty;
}
