namespace FOTN.Engine.Snapshots;

public sealed class InMemorySnapshotStore : IStateSnapshotStore
{
    private readonly Dictionary<Guid, StateSnapshot> _snapshots = new();

    public void Save(StateSnapshot snapshot)
    {
        _snapshots[snapshot.MatchId] = snapshot;
    }

    public StateSnapshot? LoadLatest(Guid matchId)
    {
        return _snapshots.TryGetValue(matchId, out var snapshot)
            ? snapshot
            : null;
    }
}
