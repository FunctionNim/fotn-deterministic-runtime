using FOTN.Engine.Agents;
using FOTN.Engine.Battle;
using FOTN.Engine.State;

namespace FOTN.Engine.Runtime;

public sealed class RuntimeBattleExecutionLink
{
    private readonly RuntimeBattleOrchestrator _battle = new();

    public BattleContext Execute(
        GameState state,
        AgentEntity attacker,
        AgentEntity defender)
    {
        return _battle.ExecuteBattle(
            state,
            attacker,
            defender);
    }
}
