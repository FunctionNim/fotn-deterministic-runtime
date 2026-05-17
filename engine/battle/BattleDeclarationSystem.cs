using FOTN.Engine.Agents;
using FOTN.Engine.State;

namespace FOTN.Engine.Battle;

public sealed class BattleDeclarationSystem
{
    public BattleContext DeclareBattle(
        GameState state,
        AgentEntity attacker,
        AgentEntity defender)
    {
        return new BattleContext
        {
            BattleId = Guid.NewGuid(),
            TurnNumber = state.TurnNumber,
            Tick = state.DeterministicTick,
            Attackers = new List<string> { attacker.AgentId },
            Blockers = new List<string> { defender.AgentId }
        };
    }
}
