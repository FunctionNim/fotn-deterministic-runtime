namespace FOTN.Engine.Persistence;

public sealed class ContinuityPersistenceRuntime
{
    public ContinuitySaveState CreateSave(
        long tick,
        int civilizations
    )
    {
        return new ContinuitySaveState(
            Guid.NewGuid(),
            tick,
            civilizations,
            $"SAVE::{tick}::{civilizations}"
        );
    }

    public CivilizationProfile CreateCivilization(
        string id,
        string name
    )
    {
        return new CivilizationProfile(
            id,
            name,
            1,
            100,
            $"CIV::{id}"
        );
    }
}
