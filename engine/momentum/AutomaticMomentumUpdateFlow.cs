using FOTN.Engine.Agents;
using FOTN.Engine.State;

namespace FOTN.Engine.Momentum;

public sealed class AutomaticMomentumUpdateFlow
{
    private readonly CombatMomentumService _combat = new();

    public void Resolve(
        PlayerState attackerOwner,
        AgentEntity attacker,
        AgentEntity defender)
    {
        _combat.AwardCombatMomentum(
            attackerOwner,
            attacker,
            defender);
    }
}
