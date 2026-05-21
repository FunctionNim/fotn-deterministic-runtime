namespace FOTN.Engine.Snapshots;

public interface IStateSnapshotStore
{
    void Save(StateSnapshot snapshot);

    StateSnapshot? LoadLatest(Guid matchId);
}
