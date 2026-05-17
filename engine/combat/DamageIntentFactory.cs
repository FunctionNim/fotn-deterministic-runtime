using FOTN.Engine.Agents;

namespace FOTN.Engine.Combat;

public sealed class DamageIntentFactory
{
    public DamageIntent Create(
        AgentEntity attacker,
        AgentEntity target,
        long tick)
    {
        return new DamageIntent
        {
            DamageIntentId = Guid.NewGuid(),
            Tick = tick,
            SourceId = attacker.AgentId,
            AttackerId = attacker.AgentId,
            TargetId = target.AgentId,
            DamageAmount = attacker.Attack,
            IntentType = DamageIntentType.Targeted
        };
    }
}
