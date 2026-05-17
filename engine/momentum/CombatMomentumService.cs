using FOTN.Engine.Agents;
using FOTN.Engine.State;

namespace FOTN.Engine.Momentum;

public sealed class CombatMomentumService
{
    private readonly MomentumResolver _resolver = new();

    public void AwardCombatMomentum(
        PlayerState player,
        AgentEntity attacker,
        AgentEntity defender)
    {
        if (defender.Defeated)
        {
            _resolver.AddMomentum(player, 1);
        }
    }
}
