using FOTN.Engine.Actions;
using FOTN.Engine.State;
using FOTN.Engine.Validation;

namespace FOTN.Engine.Audit;

public sealed class ValidationAuditInsertion
{
    public ValidationAuditRecord Record(
        ActionIntent intent,
        ValidationResult result)
    {
        return new ValidationAuditRecord
        {
            AuditId = Guid.NewGuid(),
            ActionType = intent.ActionType,
            ActorId = intent.ActorId,
            Passed = result.IsValid,
            Error = result.Error
        };
    }
}

public sealed class ValidationAuditRecord
{
    public Guid AuditId { get; init; }

    public string ActionType { get; init; } = string.Empty;

    public string ActorId { get; init; } = string.Empty;

    public bool Passed { get; init; }

    public string Error { get; init; } = string.Empty;
}
