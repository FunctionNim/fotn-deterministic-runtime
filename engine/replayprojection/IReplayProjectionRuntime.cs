using FOTN.Engine.Audit;
using FOTN.Engine.Replay;
using FOTN.Engine.State;

namespace FOTN.Engine.ReplayProjection;

public interface IReplayProjectionRuntime
{
    ReplayProjectionSnapshot Project(
        GameState state,
        IEnumerable<ReplayFrame> replayFrames,
        IEnumerable<AuditEntry> auditEntries
    );
}
