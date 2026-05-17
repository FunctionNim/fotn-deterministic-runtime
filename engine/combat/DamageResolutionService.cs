using FOTN.Engine.State;

namespace FOTN.Engine.Combat;

public sealed class DamageResolutionService
{
    public void ResolveDamage(
        GameState gameState,
        IEnumerable<DamageIntent> intents)
    {
        var orderedIntents = intents
            .OrderBy(x => x.IntentType)
            .ThenBy(x => x.Tick)
            .ThenBy(x => x.DamageIntentId)
            .ToList();

        foreach (var intent in orderedIntents)
        {
            if (intent.Resolved)
            {
                continue;
            }

            intent.Resolved = true;

            gameState.DeterministicTick++;
        }
    }
}
