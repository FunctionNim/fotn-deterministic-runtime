using FOTN.Engine.State;

namespace FOTN.Engine.Audit;

public sealed class RuntimeStateMutationAudit
{
    public MutationAuditRecord Record(
        string beforeHash,
        string afterHash,
        string mutationType)
    {
        return new MutationAuditRecord
        {
            MutationId = Guid.NewGuid(),
            BeforeHash = beforeHash,
            AfterHash = afterHash,
            MutationType = mutationType,
            Timestamp = DateTime.UtcNow
        };
    }
}

public sealed class MutationAuditRecord
{
    public Guid MutationId { get; init; }

    public string BeforeHash { get; init; } = string.Empty;

    public string AfterHash { get; init; } = string.Empty;

    public string MutationType { get; init; } = string.Empty;

    public DateTime Timestamp { get; init; }
}
