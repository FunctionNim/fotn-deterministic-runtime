using FOTN.Engine.Snapshots;

namespace FOTN.Tests;

public sealed class SnapshotPersistenceTests
{
    public void SnapshotStore_ShouldSaveAndRestore()
    {
        var store = new InMemorySnapshotStore();

        var snapshot = new StateSnapshot(
            Guid.NewGuid(),
            10,
            1,
            "HASH",
            "PAYLOAD"
        );

        store.Save(snapshot);

        var restored = store.LoadLatest(snapshot.MatchId);

        if (restored is null)
        {
            throw new Exception("Snapshot restoration failed.");
        }
    }
}
