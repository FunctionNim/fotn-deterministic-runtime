using FOTN.Engine.Audit;
using FOTN.Engine.State;

namespace FOTN.Engine.InformationBox;

public interface IInformationBoxRuntime
{
    InformationBoxSnapshot Reveal(
        GameState state,
        IEnumerable<AuditEntry> auditEntries,
        bool authorized
    );
}
