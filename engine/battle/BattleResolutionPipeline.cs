using FOTN.Engine.Combat;
using FOTN.Engine.Resolution;
using FOTN.Engine.State;

namespace FOTN.Engine.Battle;

public sealed class BattleResolutionPipeline
{
    private readonly DeterministicResolver _resolver = new();
    private readonly DamageResolutionService _damageResolution = new();

    public ResolutionLock Execute(
        GameState state,
        BattleContext battle)
    {
        var lockState = _resolver.CreateResolutionLock(
            Enumerable.Empty<Actions.ActionIntent>(),
            battle.DamageIntents,
            state.DeterministicTick);

        battle.ResolutionLocked = true;

        _damageResolution.ResolveDamage(
            state,
            battle.DamageIntents);

        battle.DamageResolved = true;

        lockState.ResolutionComplete = true;

        state.DeterministicTick++;

        return lockState;
    }
}
