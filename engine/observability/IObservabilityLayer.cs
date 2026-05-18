using FOTN.Engine.Audit;
using FOTN.Engine.Pressure;
using FOTN.Engine.Replay;
using FOTN.Engine.State;

namespace FOTN.Engine.Observability;

public interface IObservabilityLayer
{
    ObservabilitySnapshot Observe(
        GameState state,
        IEnumerable<AuditEntry> auditEntries,
        IEnumerable<ReplayFrame> replayFrames,
        PressureState pressureState
    );
}
