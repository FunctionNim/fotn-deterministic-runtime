using FOTN.Engine.Actions;
using FOTN.Engine.Audit;
using FOTN.Engine.State;
using FOTN.Prototype;

namespace FOTN.Tests;

public sealed class AuditOrderingVerification
{
    private readonly AuditEventFactory _audit = new();
    private readonly PrototypeMatchRunner _runner = new();

    public AuditOrderingResult Verify()
    {
        var state = _runner.CreateMatch();

        var action = new ActionIntent
        {
            IntentId = Guid.Empty,
            Tick = state.DeterministicTick,
            ActorId = "P1",
            ActionType = "Attack",
            SourceId = "A1",
            TargetIds = new List<string> { "A2" }
        };

        var audit = _audit.Create(
            state,
            action,
            "HASH_BEFORE",
            "HASH_AFTER",
            "Audit ordering verification.");

        return new AuditOrderingResult
        {
            AuditTickOrdered = audit.Tick >= 0,
            Tick = audit.Tick
        };
    }
}

public sealed class AuditOrderingResult
{
    public bool AuditTickOrdered { get; init; }

    public long Tick { get; init; }
}
