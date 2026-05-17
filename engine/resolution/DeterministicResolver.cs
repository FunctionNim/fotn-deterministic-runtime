using FOTN.Engine.Actions;
using FOTN.Engine.Combat;

namespace FOTN.Engine.Resolution;

public sealed class DeterministicResolver
{
    public ResolutionLock CreateResolutionLock(
        IEnumerable<ActionIntent> actionIntents,
        IEnumerable<DamageIntent> damageIntents,
        long tick)
    {
        return new ResolutionLock
        {
            ResolutionLockId = Guid.NewGuid(),
            Tick = tick,
            TargetsLocked = true,
            DamageLocked = true,
            ResolutionComplete = false,
            LockedIntentIds = actionIntents
                .Select(x => x.IntentId)
                .ToList()
        };
    }

    public IEnumerable<DamageIntent> OrderDamageIntents(
        IEnumerable<DamageIntent> intents)
    {
        return intents
            .OrderBy(x => x.IntentType)
            .ThenBy(x => x.Tick)
            .ThenBy(x => x.DamageIntentId);
    }
}
