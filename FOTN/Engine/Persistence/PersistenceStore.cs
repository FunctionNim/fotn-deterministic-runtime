namespace FOTN.Engine.Persistence;

/// <summary>
/// Abstract persistence storage contract for runtime continuity.
/// </summary>
public interface IPersistenceStore
{
    void Save(RuntimeSnapshot snapshot);

    RuntimeSnapshot? LoadLatest();
}
