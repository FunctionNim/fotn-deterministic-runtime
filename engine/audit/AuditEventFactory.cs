using FOTN.Engine.Actions;
using FOTN.Engine.Runtime;

namespace FOTN.Engine.State;

public sealed class AuditEventFactory
{
    private readonly DeterministicRuntimeContext _runtime = DeterministicRuntimeContextRegistry.Shared;

    public AuditEvent Create(
        GameState state,
        ActionIntent intent,
        string beforeHash,
        string afterHash,
        string consequence)
    {
        return new AuditEvent
        {
            EventId = CreateDeterministicGuid("AUDIT"),
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

    private Guid CreateDeterministicGuid(string prefix)
    {
        var id = _runtime.Ids.Next(prefix).Split('_').Last();

        return Guid.Parse($"00000000-0000-0000-0000-{id.PadLeft(12, '0')}");
    }
}
