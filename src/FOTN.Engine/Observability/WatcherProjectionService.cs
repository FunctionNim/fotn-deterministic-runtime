using FOTN.Engine.State;
using FOTN.Engine.Watcher;

namespace FOTN.Engine.Observability;

public sealed class WatcherProjectionService
{
    public WatcherSnapshot Create(
        GameState state
    )
    {
        return new WatcherSnapshot(
            Tick: state.DeterministicTick,
            StateHash: state.StateHash,
            VisibleAuditEvents: state.AuditLog.Count,
            VisibleReplayFrames: 0,
            VisiblePressureNodes: 0,
            InformationBoxReady: state.CurrentPhase == Phase.EndStep
        );
    }
}
