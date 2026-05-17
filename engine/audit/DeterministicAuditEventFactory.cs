using FOTN.Engine.Actions;
using FOTN.Engine.Runtime;
using FOTN.Engine.State;

namespace FOTN.Engine.Audit;

public sealed class DeterministicAuditEventFactory
{
    private readonly DeterministicRuntimeContext _runtime;

    public DeterministicAuditEventFactory(
        DeterministicRuntimeContext runtime)
    {
        _runtime = runtime;
    }

    public AuditEvent Create(
        GameState state,
        ActionIntent intent,
        string beforeHash,
        string afterHash,
        string consequence)
    {
        return new AuditEvent
        {
            EventId = Guid.Parse("00000000-0000-0000-0000-" + _runtime.Ids.Next("AUDIT").Replace("AUDIT_", "")),
            Tick = _runtime.Clock.Advance(),
            TurnNumber = state.TurnNumber,
            Phase = state.CurrentPhase.ToString(),
            ActorId = intent.ActorId,
            ActionType = intent.ActionType,
            SourceId = intent.SourceId,
            TargetIds = intent.TargetIds,
            BeforeStateHash = beforeHash,
            AfterStateHash = afterHash,
            ConsequenceSummary = consequence
        };
    }
}
