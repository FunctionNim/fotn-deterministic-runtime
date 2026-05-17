using FOTN.Engine.State;

namespace FOTN.Engine.Replay;

public sealed class ReplayFrameGenerator
{
    public ReplayFrame Generate(GameState state)
    {
        return new ReplayFrame
        {
            Tick = state.DeterministicTick,
            TurnNumber = state.TurnNumber,
            Phase = state.CurrentPhase.ToString(),
            StateHash = state.StateHash,
            AuditEventIds = state.AuditLog
                .Select(x => x.EventId)
                .ToList()
        };
    }
}
