using FOTN.Engine.Agents;

namespace FOTN.Engine.Combat;

public sealed class CombatMutationService
{
    public void ApplyDamage(
        AgentEntity target,
        int damage)
    {
        target.Barrier -= damage;

        if (target.Barrier <= 0)
        {
            target.Barrier = 0;
            target.Defeated = true;
        }
    }
}
