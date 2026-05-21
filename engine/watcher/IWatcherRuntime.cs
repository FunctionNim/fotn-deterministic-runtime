using FOTN.Engine.Audit;
using FOTN.Engine.Observability;
using FOTN.Engine.Pressure;
using FOTN.Engine.Replay;
using FOTN.Engine.State;

namespace FOTN.Engine.Watcher;

public interface IWatcherRuntime
{
    WatcherSnapshot Observe(
        GameState state,
        IEnumerable<AuditEntry> auditEntries,
        IEnumerable<ReplayFrame> replayFrames,
        PressureState pressureState,
        ObservabilitySnapshot observabilitySnapshot
    );
}
