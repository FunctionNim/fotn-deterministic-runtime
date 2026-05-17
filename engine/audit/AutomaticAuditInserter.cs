using FOTN.Engine.Actions;
using FOTN.Engine.State;

namespace FOTN.Engine.Audit;

public sealed class AutomaticAuditInserter
{
    private readonly AuditEventFactory _factory = new();

    public void Insert(
        GameState state,
        ActionIntent intent,
        string beforeHash,
        string afterHash,
        string consequence)
    {
        var auditEvent = _factory.Create(
            state,
            intent,
            beforeHash,
            afterHash,
            consequence);

        state.AuditLog.Add(auditEvent);
    }
}
