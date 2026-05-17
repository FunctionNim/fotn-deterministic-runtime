using FOTN.Engine.Actions;

namespace FOTN.Engine.State;

public sealed class AuditEventFactory
{
    public AuditEvent Create(
        GameState state,
        ActionIntent intent,
        string beforeHash,
        string afterHash,
        string consequence)
    {
        return new AuditEvent
        {
            EventId = Guid.NewGuid(),
            Tick = state.DeterministicTick,
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
