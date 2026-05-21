namespace FOTN.Engine.Identity;

public sealed class ContinuityIdentityRuntime
{
    public ContinuityIdentityState CreateIdentity(
        string ownerId,
        int age
    )
    {
        return new ContinuityIdentityState(
            Guid.NewGuid().ToString(),
            ownerId,
            age,
            age < 100,
            $"IDENTITY::{ownerId}::{age}"
        );
    }

    public CivilizationIdentityState CreateCivilization(
        string civilizationId,
        int strength
    )
    {
        return new CivilizationIdentityState(
            civilizationId,
            strength,
            true,
            $"CIV::{civilizationId}::{strength}"
        );
    }
}
